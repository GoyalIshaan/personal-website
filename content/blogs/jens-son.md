# I made the best inference chip in the world

*A Qwen3.5-9B inference chip built in RTL, with a custom instruction set, assembler, and simulators.*

I built **Jen’s Son**, a programmable inference chip for Qwen3.5-9B at batch 1. I implemented the whole chip in SystemVerilog, including the matrix and vector units, scalar core, SRAM interface, and DMA engines. I designed its **four-slot, 256-bit VLIW ISA** and wrote the assembler, weight packer, program generators, and functional and timing simulators.

I ran the prefill and decode programs in Verilator on a four-layer Qwen test model. **Every SRAM and DRAM byte matched** the functional simulator.

I’ve always loved chip design and wanted to get my hands dirty. So I gave myself one goal: **how many tokens per second per dollar can I get from a good open model?** I named the chip Jen’s Son after Jensen Huang, my GOAT.

At a modeled **1 GHz**, the timing simulator projects these numbers for one user at 32K context:

- **90.3 tokens/s** for plain decode
- **About 240 tokens/s** with speculative decoding at the acceptance rates I measured, and about 300 if all three drafts are accepted
- **7.4 s** to prefill a 32K-token prompt

That works out to **0.30–0.33 tokens/s per dollar** for plain decode and **about 0.8–0.9** with speculation, using a $270–305 retail-equivalent price for an 8 GB GDDR7 card I estimate would cost $135–152 to build. At **4.5 bits per weight**, the model scored within about two percentage points of full precision on the benchmarks I ran.

Here’s how that compares with selected GPUs and other accelerators:

![Jen’s Son uses the low end of its projected range. The RTX 5090 with three drafts is a measured BF16 vLLM run (88.6 tok/s). The RTX 5060 (75.4 tok/s) and RX 9070 XT (90.5 tok/s) with three drafts are estimates using matched quantization, 78% of peak bandwidth, and the 5090 run’s 2.89 tokens per step and roughly 17 ms of extra time per step. Plain GPU bars use measured runs or a 78%-bandwidth estimate.](#chart=tokens-per-dollar)

These numbers come from **co-designing the hardware, the software, and the model's numerics**.

This post is the first post and will be followed by a detailed technical worklog of what I built and the numbers behind it. That version will come out in a few days.

All the code, design notes and data are on GitHub: [github.com/GoyalIshaan/jens-son](https://github.com/GoyalIshaan/jens-son).

## The workload: one user, one model

With the goal set as the best tokens per second per dollar, the next question was what workload to serve. Given that goal, and one person with limited time, I went as specific as I could. The exact workload Jen's Son serves:

- **Model:** Qwen3.5-9B, text only, using its own multi-token-prediction head as the draft model
- **Users:** one at a time (batch 1), running the model locally
- **Context:** 32K tokens as the design point, up to 1M on the 16 GB card
- **Job:** read a prompt (prefill), then generate tokens one after another (decode), as fast and as cheaply as possible

### Why batch 1?

The chip serves one person running a model locally. At batch 1 every weight is read from memory for a single multiply-add per token, so speed is set by memory, not arithmetic:

> tokens/s per $ ≈ (bandwidth × utilization) ÷ (bytes per token × cost)

That gives 4 levers, and every design choice pulls on at least one: cheap bandwidth, high utilization, fewer bytes per weight, and small silicon.

### Why one model?

One model wasn't the starting goal. But everything in chip design is downstream of the workload you serve, and of how well you can understand it and program for it. Serving one model gives me the narrowest workload possible: one I can understand completely and optimize end to end, which makes the goal far easier to reach with a small team and limited time. A general accelerator pays for flexibility everywhere; knowing the model lets me skip that:

- **The shapes are fixed,** so every buffer is sized exactly and the schedule is worked out ahead of time.
- **The weights are fixed,** so they are laid out in memory in the order they are read, and memory streams near its peak.
- **Nothing the model doesn't use gets hardware.**

### Why Qwen3.5-9B?

It is the strongest open model under 10B parameters, Apache 2.0, and from 2026. It is also an interesting chip target: three Gated DeltaNet (linear attention) layers for every full-attention layer, a `248K-token` vocabulary, and a built-in multi-token-prediction head I use as a free draft model.

I also wanted a small model on purpose, for two reasons. First, fewer bytes of weights means less memory on the card, and memory is most of the card's cost. Second, I have no real silicon: everything runs in simulation, and every extra layer and gigabyte makes Verilator runs slower. About `9B` is as large as I could go while still picking a model people actually use.

The chip is still programmable. `Qwen3.5-9B` runs as a program on a public instruction set, so the same silicon can run fine-tunes or other models. It also opens a side goal I might take on later: training the model with RL to write faster programs for its own chip.

## Architecture at a glance

The design is built around streaming the 5.5 GB of weights past the multipliers as close to memory's peak as possible, once per token. Weights go from GDDR7 through a FIFO straight into the matrix unit.

![](#chart=architecture)

The three biggest blocks, the matrix unit, the vector unit and the DeltaNet unit, each have a section below. The rest of the chip, in brief:

- **Attention on the int8 lanes.** q·K and P·V reuse the matrix unit with int8 queries and probabilities, while the softmax between them stays fp32 on the vector unit, so there is no separate attention datapath. Quality impact was too small to measure at 32K.
- **Weight FIFO and DMA.** Four DMA engines move activations, KV and state; weights bypass SRAM entirely through a 192 KB FIFO sized so DRAM latency up to 300 ns costs nothing.
- **Control.** A small scalar core issues one 256-bit, 4-slot VLIW bundle per clock. Each slot pushes a coarse command (a whole matrix, a whole DeltaNet head) into a unit's queue, and 63 semaphores order them. The whole 9B speculative program is about 3,700 bundles long, and hardware loops replay it into about 44,000 issued per step, where a classic VLIW would need millions.
- **Speculation built in.** The model's own MTP head drafts 3 tokens per step with a trimmed 32K-token vocabulary; about 3.2 tokens come out of each step on average (2.45–3.68 when measured on a real GPU, depending on the text). DeltaNet state rolls back by replaying only the accepted updates.

> **Code:** [chip\_top.sv](https://github.com/GoyalIshaan/jens-son/blob/main/rtl/chip/chip_top.sv) wires the blocks together, with the [scalar core](https://github.com/GoyalIshaan/jens-son/blob/main/rtl/chip/chip_core.sv), [DMA engines](https://github.com/GoyalIshaan/jens-son/blob/main/rtl/chip/chip_dma.sv), [weight FIFO](https://github.com/GoyalIshaan/jens-son/blob/main/rtl/chip/chip_wfifo.sv) and [SRAM model and arbiter](https://github.com/GoyalIshaan/jens-son/blob/main/rtl/chip/chip_sram.sv), all in [rtl/chip/](https://github.com/GoyalIshaan/jens-son/tree/main/rtl/chip).

### Inside the matrix unit

The matrix unit is a **64 × 1,024 compute grid**—64 rows for 64 tokens, and 1,024 columns for 1,024 weights. Each row keeps its token’s activations parked right next to it. On every clock tick, the weight FIFO broadcasts 1,024 weights down all 64 rows at once, letting the grid compute **65,536 multiply-adds per cycle** (64 partial dot products of length 1,024).

![matrix unit pipeline · rtl/chip/chip_mxu.sv, design notes 24–26 and D-029](#chart=matrix-unit)

To keep this grid running at 1 GHz without stalling, it uses **two layers of pipelining**:

#### 1. The Inner Pipeline (For Clock Speed)

Doing a full dot product in a single 1-nanosecond clock cycle is too slow, so the math is split into a **7-stage assembly line**. A new slice of weights enters every clock tick and moves through:

1. **Decode:** Expand 4-bit compressed weights into `int8` using a small 16-entry lookup table.
2. **Multiply:** Multiply every `int8` weight by its `int8` activation across the 64 × 1,024 grid.
3. **Group Sum:** Add neighboring groups of 16 products together into exact 19-bit integers.
4. **Scale:** Apply the group's weight and activation scales (still keeping the math exact).
5. **Reduce:** Sum all 64 groups in a row using fixed-point math, then round to `fp32` once.
6. **Accumulate:** Add that `fp32` result to the output’s running total.
7. **Epilogue:** Once the final slice arrives, apply the tensor scale and either write the result out, add a residual connection, or update a running `argmax` (for picking the next token). Finished outputs stream to SRAM at 256 values per clock.

#### 2. The Outer Pipeline (To Hide Memory Latency)

A fast compute pipeline is wasted if it has to stop and wait for data. To keep the math running nonstop, **three engines overlap in parallel** using double-buffering:

- **Loader:** Fills one activation buffer while the compute grid reads from the other.
- **Compute:** Runs the 7-stage pipeline above.
- **Drain:** Empties one finished accumulator bank to SRAM while the next tile accumulates into the other.

Overlapping these three stages eliminates wait time—cutting a 32K-token prefill from **32.6 seconds down to 11.7 seconds**.

#### Where the Time Goes

- **Prefill:** Feed-forward layers dominate at **57%** of matrix unit time, followed by DeltaNet projections/chunks (**24%**) and attention (**13%**).
- **Decode (at 32K context):** The split is similar, except the **LM head**—which has to scan the entire 248K-token vocabulary for every generated token—shows up at **11%**.

![Timing simulator, grouped by command. The final 32K chunk starts at position 32,640 and ends at 32,768.](#chart=matrix-ops)

> **Code:** [chip\_mxu.sv](https://github.com/GoyalIshaan/jens-son/blob/main/rtl/chip/chip_mxu.sv) (controller, loader and drain) and [mxu\_row\_pipe.sv](https://github.com/GoyalIshaan/jens-son/blob/main/rtl/chip/mxu_row_pipe.sv) (the pipelined row). The group datapath, the [beat reducer](https://github.com/GoyalIshaan/jens-son/blob/main/rtl/mxu/beat_reducer.v) and their synthesis scripts are in [rtl/mxu/](https://github.com/GoyalIshaan/jens-son/tree/main/rtl/mxu).

### Inside the vector unit

The vector unit handles everything that isn't a giant matrix multiply—norms, RoPE, activations, softmax, quantization, and the DeltaNet state update.

At its core is a single bank of **512 `fp32` FMA lanes** (each doing a × b + c with a single rounding). Like the matrix unit, it is deeply pipelined—**8 stages**—so it can accept a fresh 512-element “beat” from 64-bank SRAM every clock tick.

![vector unit · rtl/vec/, design note 32](#chart=vector-unit)

#### How One Bank of Lanes Does Everything

Instead of building separate hardware blocks for every math function, **five lightweight sequencers** take turns steering the same 512 FMA lanes depending on the command:

- **Elementwise (“Box”) Ops:** Standard math like add, multiply, FMA, RoPE, and 4-tap convolutions stream straight through—reading a beat from SRAM every clock and writing the result back 8 clocks later.
- **Special Functions (eˣ, SiLU, Sigmoid, 1/x, 1/√x, Softplus):** These use a tiny lookup table for a rough first guess, followed by a fixed chain of FMA steps (Newton’s method or short polynomials) to refine the answer. This delivers 128 eˣ results per clock, or 64 per clock for SiLU and sigmoid.
- **Reductions (Norms & Sums):** To sum a row (like the sum of squares in RMSNorm), the unit accumulates a beat at a time and then folds the values pairwise across the lanes (256 + 128 + … + 1 = 511 additions) in a single clock. It keeps 4 rows in flight at once so the 8-stage pipeline stays busy.
- **Softmax Tile:** Runs max, subtract, eˣ, sum, and `int8` rounding on a fixed schedule, producing a 256-position row every **3 clocks**.
- **DeltaNet:** Interleaves 4 attention heads through the lanes to handle its chunked state updates.

**On-the-Fly Quantization:** Right at the write port, a built-in quantizer groups every 32 outputs, picks a power-of-two scale, and rounds them to `int8` so they are immediately ready for the matrix unit.

#### Two Clever Tricks That Keep It Simple

- **Row Packing:** Most attention heads are narrower than 512 elements (typically 64–256 wide). Instead of leaving lanes empty, the read port packs multiple short rows into a single 512-lane beat.
- **Tags Instead of a Central Controller:** Complex ops take a while to finish (SiLU takes 126 clocks), meaning the reader has moved several rows ahead by the time a result comes out. Rather than building a complex central tracker, each beat sends a small **tag** (its row, column, and any per-row scale) down parallel delay lines alongside the data. When a result reaches the write port, the writer just reads its tag to know where it belongs. If anything stalls, the whole pipeline freezes via a clock enable—no extra buffering required.

#### Where the Time Goes

- **Prefill:** DeltaNet’s chunked state updates take **39%** of vector unit time, and softmax takes **27%**. The early softmax implementation took 4,070 clocks per 1,024-position row. The fixed-schedule prefill tile produces a 256-position row every 3 clocks.
- **Decode (at 32K context):** The vector unit is busy for about **0.5 ms per token**, with softmax over the 32K cache making up half of that time.

![Timing simulator at RTL-measured rates, grouped by command](#chart=vector-ops)

> **Code:** [rtl/vec/](https://github.com/GoyalIshaan/jens-son/tree/main/rtl/vec), including the [8-stage FMA](https://github.com/GoyalIshaan/jens-son/blob/main/rtl/vec/fp32_fma_pipe8.v), the [special functions](https://github.com/GoyalIshaan/jens-son/blob/main/rtl/vec/sfu.v), the [reduction tree](https://github.com/GoyalIshaan/jens-son/blob/main/rtl/vec/reduce_tree.v), the [quantizer](https://github.com/GoyalIshaan/jens-son/blob/main/rtl/vec/act_quant32_pipe.v) and the [softmax tile](https://github.com/GoyalIshaan/jens-son/blob/main/rtl/vec/vec_smtile.sv).

### The DeltaNet unit

24 of the 9B's 32 layers are Gated DeltaNet, a form of linear attention. Normal attention keeps every past token's keys and values (the KV cache) and looks back over all of them for each new token, so its cost grows with the context. A DeltaNet head keeps a fixed-size memory instead: a 128 × 128 matrix S in fp32, 64 KiB per head, 32 heads per layer. Each new token updates that memory and reads from it in four steps:

1. **Fade:** S ← g · S. Old memories decay a little; g is a learned number between 0 and 1.
2. **Predict:** m = Sᵀk. Ask the memory what it currently holds for this token's key k.
3. **Correct:** S ← S + β · k · (v − m)ᵀ. Write in only the difference between the new value v and the prediction.
4. **Read out:** o = Sᵀq, the head's output for the query q.

The arithmetic is tiny, about 4 multiply-adds per memory value. What makes it hard for hardware is that every step needs the previous step's result, and the whole 64 KiB memory has to stream through for every token. So the DeltaNet unit isn't new arithmetic. It's a dedicated controller that drives the vector unit's FMA lanes in the right order, and it does four things to keep them busy:

- **It runs four heads at once.** An FMA takes 8 clocks, so a single head's chain of dependent steps would leave the pipeline mostly empty. With four heads interleaved, and each operation issued as soon as its inputs are ready, it stays full: 617 clocks per token for four heads.
- **It makes one pass over the memory.** The fade is folded into the same read that computes Sᵀk, and the result is written back in place.
- **It has its own SRAM banks,** four 64 KiB slots, so its traffic never competes with the other units.
- **It can roll back.** While draft tokens are being checked, it logs k, v, β and g instead of committing them, then replays only the tokens that were accepted.

Prefill is different: there, a chunked form of the same maths turns 64 tokens at a time into matrix products, which run on the matrix unit.

**Why it matters at long context.** In decode, the 24 DeltaNet layers cost 2.1 ms per token whether the context is 1K or 128K, because each head's memory is a fixed 64 KiB. The 8 attention layers cost 0.6 ms at 1K and 6.3 ms at 128K, because their KV cache grows. That's why decode only slows from 100 to 69 tokens/s across that whole range.

![Timing simulator at RTL-measured rates, busy time per decode token](#chart=deltanet-vs-attention)

> **Code:** [vec\_dn\_head.sv](https://github.com/GoyalIshaan/jens-son/blob/main/rtl/vec/vec_dn_head.sv) (one head's step) and [vec\_dn\_group.sv](https://github.com/GoyalIshaan/jens-son/blob/main/rtl/vec/vec_dn_group.sv) (four heads interleaved).

### The instruction set and the software stack

The chip has no model hardwired into a state machine. Qwen3.5-9B runs as a program on a VLIW instruction set I designed for this chip, so that there is atleast some programmability to the chip.

It is a **coarse-grained VLIW**. In a classic VLIW, the compiler fills every slot of every instruction on every clock, scheduling each multiply and each load by hand. This one doesn't feed the units cycle by cycle. Each bundle has 4 slots, one per kind of unit, and each slot hands a whole command (a whole matrix multiply, a whole DeltaNet head, a 3-D copy) to that unit's queue. It follows the **decoupled access-execute** style: the DMA engines that move data (access) and the matrix and vector units that compute (execute) each work from their own queue, at their own pace. The unit works through the command at its own pace for hundreds or thousands of clocks. Counting semaphores keep them in step by telling one unit when another's output is ready.

What a bundle and a command look like:

- **Coarse commands in 4-slot bundles.** Each 256-bit bundle has a scalar/control slot, a DMA slot, a matrix slot and a vector slot. One command can be a whole matrix multiply or a whole DeltaNet head, pushed into a 16-deep queue for its unit. Commands wait on and signal 63 counting semaphores, so the units run in parallel without stepping on each other.
- **Descriptors and loops.** Command shapes live in a table of 1,024 descriptors of 64 bytes each, with 4 nested hardware loops and 32 scalar registers in the core.

Why I chose this:

- **At batch 1, DRAM sets the pace,** so what matters is keeping every queue full, not micro-scheduling arithmetic.
- **Programs stay tiny.** About 44,000 bundles are issued per speculative step instead of about 12.7 million, and the whole program fits in 256 KB of instruction memory.
- **Units are decoupled.** One unit can stall on memory or run ahead without stopping the others, and the hardware needs no complex dynamic scheduler.
- **It is a search space a compiler, or an RL-trained model, can actually explore.**

Around the ISA I built the software stack that the hardware is checked against:

- an **assembler** with labels, counted branches and a lint that rejects unsafe in-place memory overlaps
- a **weight packer** that turns the quantized model into the chip's DRAM layout
- a **performance model**, a **timing simulator** and a **functional simulator** that runs the real program with real values
- the **bit-exact golden model** and the test-vector generators the RTL is compared against
- a **Verilator harness** that runs whole-chip programs and lines up the RTL's timing against the model, command by command

> Side note: a side goal I might take on later is RL-ing Qwen3.5-9B to write faster programs for the chip, rewarded by correct output in fewer cycles. The public ISA and the simulators are exactly what that would need.

> **Code:** the [ISA reference](https://github.com/GoyalIshaan/jens-son/blob/main/design/spec/isa_v1_reference.md), the assembler in [isa\_v1.py](https://github.com/GoyalIshaan/jens-son/blob/main/isa/isa_v1.py), the Qwen3.5 program in [qwen\_v1.py](https://github.com/GoyalIshaan/jens-son/blob/main/isa/qwen_v1.py), and the [timing](https://github.com/GoyalIshaan/jens-son/blob/main/isa/sim_v1.py) and [functional](https://github.com/GoyalIshaan/jens-son/blob/main/isa/fsim_v1.py) simulators, all in [isa/](https://github.com/GoyalIshaan/jens-son/tree/main/isa).

## Numerics of the model

I measured every number format on real text and real tasks (GSM8K, HumanEval, MBPP), with KL divergence against the `bf16` model as the fine-grained check. Here is the numeric's spec: (every format below was picked against both quality and hardware cost):

- **Weights, 4.5 bits.** A 4-bit code looks up a learned 16-entry table per matrix, with an 8-bit float scale per 16 weights, rounded with GPTQ. The 4.5 is simple arithmetic: 16 weights × 4 bits = 64 bits, plus one 8-bit scale, is 72 bits per 16 weights, or 4.5 bits each. (The 16-byte table per matrix adds almost nothing.) Plain int4 gave 3× the error on code (KL 0.153 vs 0.050). The table entries are int8, so every multiplier is a cheap int8 × int8 one.
- **Activations, int8 with power-of-two scales.**  I started off with just int8 activations and learnt group 32 scales, but while implementing the Matrix Unit of the chip I realized that rounding each scale to a power of two made the matrix unit's scale step 84% smaller and fit it in one clock. On GSM8K and HumanEval the change was within noise.(these activations are essentially MXINT8).

> **Note:** Attention's two matrix products (q·K and P·V) run on the int8 lanes, while the softmax between them stays fp32. The int8 rounding was too small to measure next to the weights' error, even at 32K, so attention needs no datapath of its own.

- **KV cache int8** with one scale per head: each head's 256-value key or value vector gets its own fp16 scale. Heads differ a lot in magnitude, so one shared scale would waste most of the int8 range on the quiet ones. A scale per head costs only 2 bytes per 256 values, and was already near lossless (KL 0.0003 at 32K).
- **DeltaNet state stays fp32,** because bf16 state drifted (+3.4% error at 32K, and growing).
- **Special functions** (exp, sigmoid, 1/√x) as table-plus-Newton algorithms, sized by measurement: `exp` turns out to be pretty sensitive and thus, gets 16 bits.
- **Chunked DeltaNet for prefill** splits each operand into two int8 halves over 3 passes, which keeps quality where one pass lost it on code.

## Headline numbers

Every number in this section comes from running the real Qwen3.5-9B program through the chip's timing simulator, with each command charged the clocks the RTL actually takes for it. The RTL itself is too slow to run a whole 9B token (that's tens of millions of clocks), so those per-command costs are measured on smaller models with the same shapes. How the chip was tested is [further down](#how-i-tested-it). The simulator uses a 1 GHz clock. Every component meets that target in pre-layout synthesis, with the longest critical path just under 1 ns.

| Qwen3.5-9B, batch 1 | Today |
| --- | --- |
| Decode at 32K context | **90.3 tok/s** |
| Decode with speculation (3 drafts) at 32K | **about 240 tok/s**; 299.6 when all 3 drafts are accepted |
| 32K-token prompt (prefill) | **7.4 s** |
| 20K-token prompt (prefill) | **4.2 s** |
| Tokens/s per $ at 32K, plain | **0.30–0.33** |
| Tokens/s per $ at 32K, with speculation | **0.79–0.89** |
| Design context | **32K tokens** |

Tokens per dollar uses a retail-equivalent price of 2× the card's build cost ($135–152 for the 8 GB card, worked out in the last section), so it can be compared with retail GPUs. Speculation is nearly free on this chip, because the matrix unit is otherwise idle in decode.

### Across context lengths

![Timing simulator at RTL-measured rates; speculation uses the measured acceptance mix](#chart=context-sweep)

Decode barely notices the context until the KV cache gets big: 100 tokens/s at 1K, 90 at 32K and 69 at 128K, because the weights are most of the bytes every token reads. With speculation it's 263, 240 and 191. Prefill grows faster than the prompt, because attention's work grows with the square of its length: 0.18 s for 1K tokens, 1.6 s for 8K, 7.4 s for 32K and 48 s for 128K. Three of every four layers are DeltaNet, whose cost per token doesn't grow with context, and that keeps the curve from getting steeper.

### Where the time goes: prefill vs decode

![Timing simulator at RTL-measured rates, 1 GHz, 64-bank skewed SRAM](#chart=unit-share)

In prefill, 128 tokens go through every weight at once, so the arithmetic is the limit. In one chunk the matrix unit is busy 16.6 ms of 28.8 ms and the vector unit 16.8 ms, while the weight stream is busy only 32% of the time. The two compute units mostly take turns rather than overlap: attention's softmax has to finish before the next matrix product can start, so the vector unit sits on the critical path as often as the matrix unit does. That's why most of the profiling went into the vector unit.

Decode is the opposite. One token reads all 5.1 GB once, and the GDDR7 stream is busy 98% of the 11.07 ms. The matrix unit keeps pace with it (it can take 1,024 weights a clock and memory delivers about 837), and the vector unit is busy only 5%. A faster vector unit would barely change decode. Only fewer bytes or more bandwidth would.

### Speculation, checked on a real GPU

The 3.26 tokens per step came from the golden model, on the model's own greedy output, which is the easiest text a drafter will ever see. To check it, I ran the same MTP drafter in vLLM (a widely used open-source inference server) on a rented RTX 5090 with the published weights, with sampling and on text people wrote. With 3 drafts, each step produced:

- chat: 2.74 tokens greedy, 2.65 at temperature 0.7, 2.45 at 1.0
- chat with thinking on: 3.06 greedy, 2.97 at 0.6
- maths (GSM8K): 3.48 greedy, 3.42 at 0.7
- code (HumanEval): 3.68 greedy, 3.63 at 0.7
- continuing Wikipedia text: 3.17 greedy, 2.93 at 0.7

Sampling at normal temperatures costs 2–8%, and human-written text still gets about 3 tokens per step. Run through the timing simulator with that acceptance, Jen's Son does about 240 tokens/s at 32K on an average mix, from 184 for chat at temperature 1.0 up to 276 for code. When all three drafts are accepted, a step gives 4 tokens and the rate peaks at 299.6.

The same run found something I didn't expect about GPUs. At a short prompt, speculation helps the 5090 a lot: 95.8 tokens/s plain, 157.7 with 2 drafts. At 32K, every setting is slower than not speculating: 90.5 plain, against 64.4, 79.7 and 88.6 with 1, 2 and 3 drafts. The bytes aren't the reason. Each speculative step takes about 17 ms longer than its memory traffic needs, whatever the number of drafts, so something fixed in the software's long-context path is costing it. Until that's fixed, a GPU user at 32K gets nothing from the drafter. On Jen's Son, checking 4 tokens moves almost the same bytes as checking 1, and the drafter only looks at the last 4K positions.

> Code: the GPU run is [golden/specdec/beam\_specdec.py](https://github.com/GoyalIshaan/jens-son/blob/main/golden/specdec/beam_specdec.py) (RTX 5090, vLLM 0.33.0, bf16, batch 1), with results in [golden/results/specdec\_vllm.json](https://github.com/GoyalIshaan/jens-son/blob/main/golden/results/specdec_vllm.json).

### Spec sheet

|  |  |
| --- | --- |
| Clock target | 1 GHz |
| Matrix unit | 1,024 weight lanes × 64 token rows = 65,536 int8 multiply-adds, about 131 int8 TOPS peak |
| Vector unit | 512 fp32 lanes, plus special functions (128 eˣ per clock) |
| On-chip SRAM | about 6.5 MB, 64 banks, plus a 192 KB weight FIFO |
| Memory | GDDR7, 128-bit, 32 Gb/s, 512 GB/s; 8 GB base card, 16 GB long-context card |
| Weight format | 4-bit codes into a learned 16-entry table per matrix, an 8-bit scale per 16 weights: 4.5 bits per weight, 5.5 GB of weights |
| Activations, KV cache | int8 with power-of-two scales; KV int8 (int4 optional for long context) |
| Host link | PCIe Gen4 x4 on an x16 card, inside the 75 W slot budget |
| Die (estimate) | about 33–43 mm² at a 6 nm-class node, about $5–6 per die |
| Synthesis so far | ASAP7 7 nm open PDK, block by block |

**Quality at 4.5 bits.** Against the bf16 model, on the chip's exact number formats: GSM8K 87.4% vs 89.3% (−1.9 points), HumanEval 70.7% vs 69.5% and MBPP 55.4% vs 55.8% (no detectable change). Plain int4 rounding loses 7.5 points on GSM8K.

Power and whole-die area are pre-layout estimates, worked out in the last section.

## How I tested it

I tried to follow industry best practice and to be as rigorous about testing as I could. The standard parts I did as you would expect: a golden reference model, a performance model, an instruction-level simulator, RTL checked against all of them, and synthesis for area and timing. **Bit-exact at every level:** the golden model, the functional simulator and the RTL had to agree to the last bit. I did this so that any mismatch is a real bug, never rounding noise, and so that the quality I measured on the golden model carries over to the hardware exactly. I also compared every byte of SRAM and DRAM after each run, ran random and adversarial tests on top of real model data, had the assembler enforce a few safety rules, and treated a performance gap like a failing test. The timing simulator that every speed in this post comes from is checked against the RTL command by command.

## What it would cost

With the main blocks synthesized, I could finally put rough numbers on the chip's size, power and price. Everything here is pre-layout. Logic areas come from ASAP7 synthesis scaled to a 6 nm-class node; the parts I can't synthesize (the GDDR7 and PCIe interfaces, the pads) are estimates from published figures or plain guesses, and the table says which.

### Die area

| Block | Area at 6 nm-class | Where the number comes from |
| --- | --- | --- |
| Logic: matrix unit, vector unit, special functions | 7.1 mm² | synthesized on ASAP7, scaled to N6 |
| On-chip SRAM and buffers, 7.6 MB | 2.4–2.9 mm² | bit-cell area ÷ macro efficiency |
| GDDR7 interface (PHY), 128-bit | 17.4–20.4 mm² | scaled from a published HBM2e PHY |
| PCIe Gen4 x4 | 1–3 mm² | guess |
| Pads, PLLs, sensors, test | 5–10 mm² | guess |
| **Whole die** | **33–43 mm²** |  |

The die came out at about half the 80 mm² my original cost model assumed. The compute logic is only about a fifth of it, while the memory interface alone is roughly half. That's the batch-1 lesson again, this time in silicon. A few smaller blocks (the DMA engines, control, some vector-unit glue) aren't synthesized yet, so the real number will land toward the top of the range.

### Power

| Mode | Chip | GDDR7 and its interface | Card |
| --- | --- | --- | --- |
| Decode (memory bound) | 0.8–1.5 W | about 28 W | about 30 W |
| Prefill (matrix unit about 70% busy) | 3.9–6.4 W | about 6 W | about 10–12 W |

These come from energy per operation (scaled from published 45 nm figures) times how often each operation happens, plus 30% for leakage and the clock tree. Even the worst case sits far under the 75 W a PCIe slot provides, so the card needs no extra power cable. In decode the chip itself barely works: almost all the power goes into moving bytes out of memory.

### Price

| Part | Cost |
| --- | --- |
| 8 GB of GDDR7 (4 × 2 GB at $10–12/GB) | $80–96 |
| Die (33–43 mm² at 6 nm-class, about 97–98% yield) | $5–6 |
| Package | $15 |
| Board, power delivery, connector | $35 |
| **Card build cost** | **$135–152** |

To compare with GPUs sold at retail, I double that: a retail-equivalent price of about $270–305. Memory is about 60% of the build cost and the die about 4%, which is why every design choice in this post ended up being about bytes. Memory prices move the result: at $15/GB the card costs about $176 and plain decode drops to about 0.26 tokens/s per dollar, while speculation stays near 0.68.

> Code: the area, power and cost estimate is [design/calc/area\_power.py](https://github.com/GoyalIshaan/jens-son/blob/main/design/calc/area_power.py), built on the synthesis results in [rtl/results\_timing.json](https://github.com/GoyalIshaan/jens-son/blob/main/rtl/results_timing.json).

### Competing Against Perfection

To see how much better software could do, I compared each card against its theoretical ceiling, or **roofline**. At batch 1, decode does about **3–4 operations per byte**. The RTX 5060 would need about **171 operations per byte** before compute became the bottleneck. That makes this a memory-bandwidth comparison. Divide peak bandwidth by bytes per step to get steps per second, then multiply by the average tokens emitted per step.

**At 32K context and 100% of peak memory bandwidth:**

This model gives all three cards 4.5-bit weights, including the output head, and the same INT8 KV storage per value. The GPU rows use a full draft vocabulary and a 32K draft window. Jen’s Son uses a 32K-token draft vocabulary and a 4K draft window.

| Hardware | Plain | Tok/s per $ | With 3 drafts | Tok/s per $ |
| --- | --- | --- | --- | --- |
| RTX 5060 8GB, $300 | 87.7 tok/s | 0.29 | 199.2 tok/s | 0.66 |
| RTX 5090 32GB, $1,999 | 350.6 tok/s | 0.18 | 796.7 tok/s | 0.40 |
| Jen's Son, $270–305 | 100.2 tok/s | 0.33–0.37 | 281.1 tok/s | 0.92–1.04 |

At 100% bandwidth, the RTX 5060 reaches **0.29 tok/s per dollar** for plain decode. Jen’s Son is projected to reach **0.30–0.33 tok/s per dollar** at 92% bandwidth utilization.

I’ll post the technical worklog in a few days, with more on how I built and tested the chip. Thanks for reading.
