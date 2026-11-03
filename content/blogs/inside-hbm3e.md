# Inside HBM3E

<!-- Diagram notes keep paragraphs connected to the explorer. Edit the Markdown normally; keep a note with its paragraph when moving it. -->

<!-- hbm:paragraph {"id": "intro-0", "focus": 0} -->

Generating one token from an 8B-parameter model in BF16 means reading all 16 GB of its weights out of memory. An H100 pulls about 3.35 TB/s from its HBM, so a single sequence can't decode faster than about 4.8 ms per token, or roughly 200 tokens per second. No matter how fast the tensor cores are, the compute keeps waiting on memory. [18]

<!-- hbm:paragraph {"id": "intro-1", "focus": 0} -->

This post is about that **memory**: what an HBM3E stack physically is, how one read gets from a capacitor to the GPU, and why we can't just keep adding bandwidth. The HBM model alongside follows as you scroll.

<!-- hbm:section {"id": "why-hbm", "focus": 0} -->

## What is HBM, and why do we need it?

<!-- hbm:paragraph {"id": "why-hbm-0"} -->

HBM, or High Bandwidth Memory, is a kind of Dynamic Random Access Memory, or DRAM. Every memory system trades off 4 things: latency (how long one request takes), bandwidth (how many bytes per second we can keep moving), capacity (how much it stores) and power. There are multiple kinds of DRAM, such as DDR, LPDDR, GDDR and HBM, which all store bits in the same [basic DRAM cell](#one-bit): one transistor and one capacitor per bit. What separates them is which of those 4 they optimize, and that mostly comes down to how they connect to the processor. [14]

<!-- hbm:paragraph {"id": "why-hbm-1"} -->

> **Note:** DDR is short for double data rate. A DDR memory transfers data on both the rising and the falling edge of its clock, so each pin moves two bits per clock cycle instead of one.

<!-- hbm:paragraph {"id": "why-hbm-2"} -->

LPDDR, Low Power DDR, goes in phones and laptops, where battery life matters more than peak bandwidth. It saves power three ways. It runs at a lower supply voltage. It uses low-swing signaling, meaning the voltage gap between a 0 and a 1 on each wire is kept small, so every flip of a wire costs less energy. And whenever it's idle it drops into low-power states such as self-refresh, where the DRAM keeps its own data alive on an internal timer so the processor's memory controller can switch off. [11] [14]

<!-- hbm:paragraph {"id": "why-hbm-3"} -->

GPUs care about the opposite: bandwidth above everything else. A GPU runs thousands of threads at once, and the data they work on (textures and frame buffers for graphics; weights, activations and KV cache for AI) is far too big to keep on the chip. It has to be streamed in from memory over and over, so how fast memory can deliver bytes caps how fast the GPU can work. The decode example at the top is the extreme case: every byte of the model, for every token.

<!-- hbm:paragraph {"id": "why-hbm-4"} -->

GDDR, Graphics DDR, was the first answer, and it gets its bandwidth from speed. Bandwidth comes from two numbers. Width is how many data pins move bits in parallel, where a data pin is one electrical contact between the memory and the GPU carrying one bit per transfer. Rate is how many bits each pin moves per second. $\text{bandwidth} = \text{width} \times \text{rate}$. Samsung's 2015 GDDR5 chip had 32 data pins at 8 Gb/s each, so $32 \times 8 = 256$ Gb/s, which is $256 \div 8 = 32$ GB/s per chip. Eight chips like that around a GPU give you 256 data pins and 256 GB/s. [12]

<!-- hbm:paragraph {"id": "why-hbm-5"} -->

> **Note:** the DRAM cells themselves can't run anywhere near 8 Gb/s. So GDDR5 cheats. Each internal access grabs 8 bits for every pin at once (256 bits for a 32-pin chip), and the I/O circuits then shift them out over 8 fast transfers. The slow array works at an eighth of the pin speed while the pins stay busy. This trick is called prefetch, and it shows up again in HBM's bursts. [14]

<!-- hbm:figure {"id": "why-hbm-figure-6", "type": "memory-interfaces"} -->

<!-- hbm:paragraph {"id": "why-hbm-7"} -->

To get more bandwidth you can raise the rate or the width, and GDDR hit a wall on both. Raising the rate means every pin has to switch faster, which costs more power per pin and makes the signal harder to receive cleanly across a circuit board. Raising the width means more chips and more traces across the board, and a PCB can only fit so many wires between the GPU and its memory. [13]

<!-- hbm:paragraph {"id": "why-hbm-8"} -->

HBM flips the trade. Instead of making each pin faster and faster, why not add far more pins, and lower the rate on each one so the extra pins stay manageable? What makes this possible is a **silicon interposer**: a slab of silicon under both the memory and the compute die that can route thousands of short, fine-pitch wires between them, far denser than a PCB. The first version of HBM ran 1,024 data pins at just 1 Gb/s: 32 times the width of a GDDR5 chip at an eighth of the rate, for $1024 \times 1 \div 8 = 128$ GB/s per HBM stack, 4x the chip. Short, slow wires are also cheap to drive. AMD's launch numbers put an HBM device at over 35 GB/s per watt against 10.66 GB/s per watt for its GDDR5 card, in 94% less board area. [13] [15]

<!-- hbm:paragraph {"id": "why-hbm-9"} -->

That trade is the whole post. Almost everything that follows (the stacked dies, TSVs, the base die, the packaging pain) is the cost of making that width possible. Latency isn't what HBM gave up, by the way. A random access is dominated by the DRAM core in every one of these memories; HBM just gets its bandwidth from width instead of pin speed.

<!-- hbm:section {"id": "where-the-memory-is", "focus": 0} -->

## Where does HBM sit?

<!-- hbm:paragraph {"id": "where-the-memory-is-0"} -->

HBM is not part of the compute die. It sits beside it in the same package, and both are connected through a [silicon interposer](#the-interposer) underneath. This is the "off-chip" in off-chip memory: getting data back means leaving the compute die, which is a lot more work than reading a register or on-chip SRAM, even though the memory is millimetres away. [5]

<!-- hbm:paragraph {"id": "where-the-memory-is-1"} -->

> **Note:** this layout is called 2.5D packaging. The memory dies are stacked on top of each other in 3D, but the finished HBM stack sits beside the compute die on a flat interposer instead of on top of it.

<!-- hbm:paragraph {"id": "where-the-memory-is-2"} -->

The HBM stack itself has two kinds of die. At the bottom is the [base die](#the-base-die), which sits on the interposer and handles I/O and logic; it stores no data. On top of it are the core dies, the actual DRAM layers holding billions of [DRAM cells](#one-bit). Each core die has its own sense amplifiers and row buffers, column decoders and TSV interfaces. [3]

<!-- hbm:paragraph {"id": "where-the-memory-is-3"} -->

Everything interesting about a read happens in those core dies, and they're ordinary DRAM. So we'll start from one bit in one cell and build upward, adding each piece of structure (rows, banks, channels, ranks) at the point where the design actually needs it. Then we'll follow the data out through the HBM stack, the base die and the interposer to the GPU.

<!-- hbm:section {"id": "one-bit", "focus": 1} -->

## DRAM cells

<!-- hbm:paragraph {"id": "one-bit-0", "organizationLevel": "cell"} -->

All DRAM works on the same principle: one transistor gating one capacitor. The capacitor holds the bit as charge, and the transistor connects it to the rest of the circuit. These cells are laid out in 2D grids inside each bank.

<!-- hbm:paragraph {"id": "one-bit-1", "organizationLevel": "cell"} -->

This grid is wired with two sets of lines. A **Wordline** runs along each row and connects to the gate of every transistor in that row, so it acts as that row's on switch. A **Bitline** runs down each column and connects to every cell in that column, through each cell's transistor. Raise one wordline and every cell in that row connects to its bitline, and that bitline is how we sense or change what the cell stores.

<!-- hbm:paragraph {"id": "one-bit-2", "organizationLevel": "cell"} -->

Why do we need these lines at all?

<!-- hbm:paragraph {"id": "one-bit-3", "organizationLevel": "cell"} -->

Why not wire every cell straight to the outside? Because there are billions of cells, and nothing can route billions of wires. A grid shares them. A grid of R rows and C columns needs only R wordlines and C bitlines, and any one cell is picked by the wordline and bitline that cross at it. A grid of 16,384 rows × 8,192 columns holds about 134 million cells on about 24,600 wires. Sharing a bitline has one catch: thousands of cells hang off the same wire, so the ones we aren't reading must stay out of the way. That's the job of each cell's transistor. It's a switch between the capacitor and the bitline, and only the wordline can close it. While a row's wordline is off, every capacitor in that row stays disconnected, so when we read one row, the other 16,383 cells on each bitline don't interfere.

<!-- hbm:paragraph {"id": "one-bit-4", "organizationLevel": "cell"} -->

> **Note:** The capacitors leak, so every cell has to be refreshed periodically or its charge drains away. That's the "dynamic" in dynamic RAM. (It's volatile for a simpler reason: cut the power and the data is gone, which is true of SRAM too.)

<!-- hbm:paragraph {"id": "one-bit-5", "organizationLevel": "cell"} -->

One cell on its own is useless though. What matters is how we read thousands of them quickly, so let's follow an actual read through one grid of cells.

<!-- hbm:section {"id": "opening-a-row", "focus": 2} -->

## Reading a row

<!-- hbm:paragraph {"id": "opening-a-row-0", "rowState": "open"} -->

Zoom out from one cell to a whole grid of them: thousands of rows and columns, plus three circuits around the edges. The row decoder sits down one side. It takes the row part of an address (14 bits for 16,384 rows) and turns on exactly one wordline. The sense amplifiers sit along the bottom, one per bitline. They're tiny amplifiers that read the faint signal a cell puts on its bitline, and we'll see why they're needed in a moment. The column decoder picks which bitlines' values actually get sent out.

<!-- hbm:paragraph {"id": "opening-a-row-1", "rowState": "precharged"} -->

Before a row can be opened, the bank's bitlines sit at a reference voltage roughly halfway between a `0` and a `1`. Getting them there is called **Precharging**, and it gives each cell a known starting point to nudge up or down. [7]

<!-- hbm:paragraph {"id": "opening-a-row-2", "rowState": "sensing"} -->

Who decides which row to open? The memory controller, a circuit on the GPU itself, not in the memory. When a load from a GPU core misses in the caches, the request lands in the controller's queue, and the controller turns it into DRAM commands sent over the HBM stack's command/address pins. To open a row, it sends `ACTIVATE` with a row address. The row decoder raises that one wordline, and every cell in the row connects to its bitline.

<!-- hbm:paragraph {"id": "opening-a-row-3", "rowState": "sensing"} -->

But here's the problem. A cell's capacitor holds a tiny amount of charge, while a bitline is a long wire touching thousands of cells, so it acts like a much bigger capacitor. When the transistor switches on, the cell's charge spreads out over the whole bitline, the way a cup of hot water poured into a bathtub barely warms it. The bitline's voltage moves only slightly: up a little if the cell held a `1`, down a little if it held a `0`. And the cell has now given its charge away, so its value is gone. We need something that can notice that tiny nudge and turn it back into a full `0` or `1`.

<!-- hbm:paragraph {"id": "opening-a-row-4", "rowState": "sensing"} -->

That's the sense amplifier. The reference it compares against is the precharge level from a moment ago. Every bitline started at exactly halfway, so the amp only has to answer one question: did this bitline end up a little above halfway or a little below? In practice it compares against a neighbouring bitline that was precharged the same way but has no cell connected this time, so both sides see the same noise. Above means the cell held a 1, below means 0. The amp then pushes the difference all the way to a full `0` or `1`, and, because the wordline is still on, drives that value back into the cell. Sensing and restoring are one operation. [7]

<!-- hbm:paragraph {"id": "opening-a-row-5", "rowState": "open"} -->

After sensing, each sense amplifier (there's one per bitline, so 8,192 in our example grid) holds its bitline's value, so together the row of sense amplifiers holds a copy of the entire row. That's what people mean by the **row buffer**, and an "open row" just means a row whose values are sitting there, ready to be read or written. The small grid in the diagram is one example subarray.

<!-- hbm:paragraph {"id": "opening-a-row-6", "rowState": "precharged"} -->

If the next request wants another part of the same row, we read it straight from the row buffer. If it wants a different row in the same bank, we have to close this one first. The controller sends `PRECHARGE`: the wordline drops, the cells disconnect with their restored charge, and the bitlines return to the reference voltage. Only then can we `ACTIVATE` the new row. Why not skip that step? Because each bitline has only one sense amplifier, and right now it's holding the old row's value at full voltage. Raise a second wordline and those full voltages would pour into the new row's cells and overwrite them. The bitlines have to be disconnected and reset to halfway before the next row can put its tiny signal on them. [7]

<!-- hbm:paragraph {"id": "opening-a-row-7", "rowState": "open"} -->

So two reads to the same grid can cost very different amounts. A row hit skips both `PRECHARGE` and `ACTIVATE`, while a row miss pays for both. A big part of a memory controller's job (on the GPU, remember) is scheduling around exactly this.

<!-- hbm:paragraph {"id": "opening-a-row-8", "rowState": "open"} -->

Note we haven't actually read anything yet. The whole row is sitting in the row buffer, and it's big. To put numbers on things I'll use Ramulator, an open-source DRAM simulator from the SAFARI research group whose HBM3 model follows the standard's organization and timing. In that model a row holds 256 columns of 32 bits, about 1 KB. But one request from the GPU usually wants only 32 or 64 bytes of it, and sending the whole 1 KB every time would waste almost all of the transfer. So reading is a second, separate step: **pick just the piece we want and send only that.** [16]

<!-- hbm:section {"id": "selecting-columns", "focus": 3} -->

## Picking the columns

<!-- hbm:paragraph {"id": "selecting-columns-0", "organizationLevel": "columns"} -->

The controller sends `READ` with a column address. In DRAM terms a column is a small group of bitlines (32 of them in Ramulator's HBM3 model), and the column address says which group we want. Turning that address into a choice is the column decoder's job (a decoder is a circuit that takes a binary number and switches on exactly one of its output lines). The row decoder from earlier turns a row address into one raised wordline; the column decoder turns a column address into a select signal that connects only the chosen sense amplifiers to the read path, the wires that carry data out of the grid. Every other sense amplifier stays disconnected. `ACTIVATE` chose the row; `READ` chooses the slice. In HBM3E, one `READ` takes 8 columns, 256 bits or 32 bytes, out of the row buffer at once. [16]

<!-- hbm:paragraph {"id": "selecting-columns-1", "organizationLevel": "columns"} -->

Because row access and column access are separate commands, one `ACTIVATE` can serve many `READs`. We can pull one slice, then another, then another, all from the same open row. This is also where a lot of DRAM energy hides: we activate a whole row to read a small slice of it, so every row we open and use only a little of is mostly wasted work.

<!-- hbm:section {"id": "bursts", "focus": 6} -->

## How the data leaves the grid

<!-- hbm:paragraph {"id": "bursts-0", "organizationLevel": "burst"} -->

So far everything has happened inside one grid. Now the 256 bits we picked have to leave the memory and reach the GPU, and they do that through pins.

<!-- hbm:paragraph {"id": "bursts-1", "organizationLevel": "burst"} -->

A **pin** is one external electrical connection of a chip: the point where a single wire leaves the chip so it can be connected to something else. On old chips these were literal metal legs, which is where the name comes from. On HBM there are no legs. Each pin is a microscopic solder dot (a microbump) on the underside of the base die, sitting on one wire in the interposer, and that wire runs across to a matching dot under the GPU. So one data pin is one complete wire from the memory to the GPU, plus the small driver circuit on each end that puts a voltage on it or reads one off it. Each data pin carries one bit at a time as a high or low voltage. An HBM stack has 1,024 data pins, plus more for commands, addresses, clocks and power. The data pins come in sets of 32, and each set is wired to its own collection of banks (we'll see what these sets are called in a moment).

<!-- hbm:paragraph {"id": "bursts-2", "organizationLevel": "burst"} -->

The pins switch to a fixed rhythm, and one **beat** is one tick of it: every pin in a set puts out one bit at the same moment, so a set of 32 pins moves 32 bits per beat. Beat and transfer mean the same thing here. A 9.6 Gb/s pin makes 9.6 billion transfers a second, two per clock cycle because it's DDR.

<!-- hbm:paragraph {"id": "bursts-3", "organizationLevel": "burst"} -->

Our 256 bits don't fit in one beat on 32 pins, so they go out over 8 beats in a row, 32 bits each. Those 8 beats together are a **burst**. In HBM3E the size is fixed: 8 beats on 32 pins, 32 bytes, every time. One `READ` produces one burst.

<!-- hbm:paragraph {"id": "bursts-4", "organizationLevel": "burst"} -->

It's the same prefetch trick as GDDR5: the slow grid hands over all 256 bits at once, and the fast pins stream them out over 8 beats. Bursts also spread the cost of one `READ` command over 32 bytes instead of 4, which pays off whenever the neighbouring data gets used anyway. [2]

<!-- hbm:figure {"id": "bursts-figure-5", "type": "equation", "lines": ["\\begin{aligned}\n\\frac{32\\ \\text{bits}}{8} &= 4\\ \\text{bytes per beat} \\\\\n4\\ \\text{bytes} \\times 8\\ \\text{beats} &= 32\\ \\text{bytes per burst}\n\\end{aligned}"], "note": "One pseudo-channel. The beat rate is already included in a pin's quoted Gb/s data rate."} -->

<!-- hbm:section {"id": "banks", "focus": 4} -->

## Banks and bank groups

<!-- hbm:paragraph {"id": "banks-0", "organizationLevel": "banks"} -->

Now look at the timing of one grid. Open a row, read a few bursts, `PRECHARGE`, open the next row: a lot of that time goes to `ACTIVATE` and `PRECHARGE`, and the data pins sit idle while it happens. If a whole die were one giant grid, every request would wait in line behind the last row swap. [7]

<!-- hbm:paragraph {"id": "banks-1", "organizationLevel": "banks"} -->

The fix is to split the storage into many independent grids. Each grid, with its own row decoder, sense amplifiers and column decoder, is a **bank**. Banks open and close rows on their own, so while bank 0 is busy activating a row, bank 1, which already has the row we want open, can be sending data. [7]

<!-- hbm:paragraph {"id": "banks-2", "organizationLevel": "banks"} -->

There's a catch, though. Every bank needs a way to get its data out of the HBM stack, and the only way out is through the data pins.

<!-- hbm:paragraph {"id": "banks-3", "organizationLevel": "banks"} -->

Pins are expensive. Each one is a [microbump](#tsvs-and-microbumps), an [interposer wire](#the-interposer) and a driver circuit on each end, so an HBM stack only has 1,024 of them, split into 32 sets of 32.

<!-- hbm:paragraph {"id": "banks-4", "organizationLevel": "banks"} -->

Banks are cheap by comparison. In Ramulator's HBM3 model, an 8-high HBM stack has 32 banks behind each set of pins, 1,024 banks in all. Giving every bank its own 32 pins would take over 32,000 pins.

<!-- hbm:paragraph {"id": "banks-5", "organizationLevel": "banks"} -->

So the banks behind one set of pins share it, and only one bank can send a burst on those pins at a time. Think of several kitchens sharing one serving window: they can all cook at once, but plates go out one by one. [7] [16]

<!-- hbm:paragraph {"id": "banks-6", "organizationLevel": "groups"} -->

Sharing the pins isn't the only problem. There's a second bottleneck inside the die, between a bank and those pins. When a `READ` picks 256 bits out of a bank's row buffer, those bits don't jump straight to the pins. They travel across the die on a bundle of internal data wires (the read/write path) to a circuit next to the pins that chops the 256 bits into 8 beats. Those internal wires are long, and every `READ` has to charge or drain them and let them settle before the next 256 bits can follow. That takes longer than the pins need to send a burst. [16]

<!-- hbm:paragraph {"id": "banks-7", "organizationLevel": "groups"} -->

Ramulator's HBM3 model puts numbers on it. At a 1.6 GHz clock, one burst occupies the pins for 2 cycles, or 1.25 ns. But two `READ`s that use the same internal wires must be at least 2.5 ns apart, which is 4 cycles. Send `READ`s one after another down one path and the pins sit idle half the time. [16]

<!-- hbm:paragraph {"id": "banks-8", "organizationLevel": "banks"} -->

The fix for this problem is the **Bank Group**. The banks behind one set of pins are split into a few groups, and each group gets its own set of those internal data wires; the sets only merge right at the pins. A `READ` to group 0 can be followed 2 cycles later by a `READ` to group 1, because the two travel on different wires: group 0's wires get the time they need to settle while group 1's data is going out.

<!-- hbm:paragraph {"id": "banks-9", "organizationLevel": "banks"} -->

So the controller alternates: a `READ` to group 0, then group 1, then group 0 again. Each burst starts the moment the previous one finishes, and the pins never sit idle. Back to the kitchens: if every kitchen in a group shares one hallway to the serving window, and a trip down the hallway takes twice as long as passing a plate through, one hallway keeps the window busy only half the time. Two hallways taking turns keep it full. In that HBM3 model, the banks behind each set of 32 pins come as 4 groups of 4. [16] [17]

<!-- hbm:paragraph {"id": "banks-10", "organizationLevel": "banks"} -->

There's one more limit to think about, and this one is about power. An `ACTIVATE` fires thousands of sense amplifiers at once, and each one charges or drains its bitline all the way to a full `0` or `1`. Thousands of wires switching together pull a sudden burst of current from the die's power grid. The grid can only deliver charge so fast. If several banks activated at the same moment, the grid couldn't keep up: the supply voltage on the die would briefly dip below where it should be, and a sense amplifier somewhere else could misread its cell. So the spec rations activations: in Ramulator's HBM3 model, two `ACTIVATE`s must be at least 4 cycles apart (5 within the same bank group), and no more than 4 may land in any 24 cycle window. [16]

<!-- hbm:section {"id": "channels", "focus": 5} -->

## Channels and pseudo-channels

<!-- hbm:paragraph {"id": "channels-0", "organizationLevel": "channels"} -->

Banks share data pins, so the next question is how many sets of pins there are and how they're split up.

<!-- hbm:paragraph {"id": "channels-1", "organizationLevel": "channels"} -->

We've seen that one set of data pins is shared by many banks. A **channel** is the next step up: a complete, independent connection between the GPU and one sixteenth of the banks. All of the memory belongs to the GPU, but each bank is wired to exactly one channel, so a channel can only reach its own share. It has its own data pins, its own command/address pins (the ones that carry `ACTIVATE`, `READ` and their addresses) and its own banks that no other channel can touch. Because nothing is shared, the controller can send a command on channel 3 at the same moment as one on channel 7, and neither ever waits for the other. All of those commands come from the memory controller on the GPU, which keeps a separate queue for every channel; the base die just passes each command through to the right core die. [2] [7]

<!-- hbm:paragraph {"id": "channels-2", "organizationLevel": "channels"} -->

**Why many channels instead of one big one?**

<!-- hbm:paragraph {"id": "channels-3", "organizationLevel": "channels"} -->

A road only helps the traffic on it. With one wide channel, every request in the system would queue for the same command wires and the same banks. Split the HBM stack's 1,024 data bits into many channels and many requests make progress at once, each on its own road. HBM3E uses 16 channels of 64 bits each. [1] [2]

<!-- hbm:paragraph {"id": "channels-4", "organizationLevel": "channels"} -->

A **Pseudo-Channel** splits one channel into two halves of 32 data bits each. Each half has its own data wires and its own banks, but the two share the channel's command/address wires. [2] [16]

<!-- hbm:paragraph {"id": "channels-5", "organizationLevel": "channels"} -->

**Why split a channel at all?**

<!-- hbm:paragraph {"id": "channels-6", "organizationLevel": "pseudo"} -->

1. **Access size.** The burst length is fixed at 8 beats. On a 64-bit channel that would be 8 bytes per beat and 64 bytes per burst, but a GPU usually asks for data in 32-byte sectors, so half of many bursts would be thrown away. At 32 bits wide, one burst is exactly 32 bytes.
2. **Pin cost.** The obvious way to get 32 narrow interfaces is 32 full channels, but every channel needs its own command/address pins, and those take room on the die and the interposer. Pseudo-channels get nearly the same independence (two data paths, two sets of banks) while paying for only one set of command wires per pair. The cost is that the two halves' commands take turns on that shared bus.

<!-- hbm:paragraph {"id": "channels-7", "organizationLevel": "channels"} -->

So per HBM stack: $16 \times 2 = 32$ pseudo-channels of 32 bits each, 1,024 data bits in total.

<!-- hbm:figure {"id": "channels-figure-8", "type": "channels"} -->

<!-- hbm:paragraph {"id": "channels-9", "organizationLevel": "pseudo"} -->

HBM2 cut the same 1,024 bits into 8 channels of 128 bits and 16 pseudo-channels of 64 bits. HBM3 doubled the count and halved the width, for exactly the reasons above.

<!-- hbm:section {"id": "ranks", "focus": 5} -->

## Ranks: more storage behind the same wires

<!-- hbm:paragraph {"id": "ranks-0", "organizationLevel": "ranks"} -->

Everything so far added parallelism. **Ranks** add capacity.

<!-- hbm:paragraph {"id": "ranks-1", "organizationLevel": "ranks"} -->

Picture one pseudo-channel in a 4-high HBM stack. It has 32 data pins and one command bus, and 16 banks are wired to them, arranged as 4 bank groups of 4. All 16 sit on one core die.

<!-- hbm:paragraph {"id": "ranks-2", "organizationLevel": "ranks"} -->

Now make the HBM stack 8-high. The four new dies hold more banks, and those banks need a way out too. We can't add pins, because every pin costs a microbump, an interposer wire and a driver on each end. So the banks on a new die are wired onto an existing pseudo-channel: the same 32 data pins and the same command bus. That pseudo-channel now has 32 banks behind it, 16 on its original die and 16 on a die higher up.

<!-- hbm:paragraph {"id": "ranks-3", "organizationLevel": "ranks"} -->

The original 16 banks are one **rank**, and the 16 new ones are a second rank. A rank is a complete collection of banks, all 4 bank groups of them, on its own die. Nothing about the pins is copied: there are still 32 data pins and one command bus, and the two ranks take turns using them. In HBM3 and HBM3E a rank is called a **Stack ID**, or SID, because each rank sits on a different die of the HBM stack.

<!-- hbm:paragraph {"id": "ranks-4", "organizationLevel": "ranks"} -->

**How does the memory know which rank a command is for?**

<!-- hbm:paragraph {"id": "ranks-5", "organizationLevel": "ranks"} -->

Every command carries a SID bit (or two), just as it carries bank-group and bank bits. Every rank sees the command on the shared bus, but only the one whose SID matches acts on it; the others ignore it. It's the same trick as choosing a bank, applied one level up.

<!-- hbm:paragraph {"id": "ranks-6", "organizationLevel": "ranks"} -->

So nothing is merged into a bigger channel. The pseudo-channel stays exactly 32 pins wide, it just has more banks hanging off it. That's why ranks add capacity but not bandwidth: there are still only 32 pins, and still only one burst on them at a time.

<!-- hbm:paragraph {"id": "ranks-7", "organizationLevel": "ranks"} -->

**Does sharing cause problems though?**

<!-- hbm:paragraph {"id": "ranks-8", "organizationLevel": "ranks"} -->

A little. Only one rank can drive the pins at a time, and handing the pins from one SID to another costs a small gap, which Ramulator's HBM3 model estimates at about one extra cycle. In return the controller gets more banks to work with, so more rows can be open at once and more row work can overlap. [16]

<!-- hbm:section {"id": "one-address", "focus": 5} -->

## Putting it together: one address

<!-- hbm:paragraph {"id": "one-address-0", "organizationLevel": "address"} -->

Now run the hierarchy the other way, top-down, the way the memory controller sees it. Every address the GPU sends gets chopped into fields: channel, pseudo-channel, SID, bank group, bank, row and column. Each field picks one branch of everything we just built, and the last two pick a row in one grid and a 32-byte slice of it. [9] [16]

<!-- hbm:paragraph {"id": "one-address-1", "organizationLevel": "address"} -->

How the controller assigns those fields is called address interleaving, and it decides how much of that hardware actually gets used. Take four consecutive 32-byte blocks and map them to channel 0/bank 0, channel 1/bank 0, channel 0/bank 1 and channel 1/bank 1. A sequential read now uses two channels' pins at once and overlaps row work in two banks on each. [9] [16]

<!-- hbm:paragraph {"id": "one-address-2", "organizationLevel": "address"} -->

Real mappings are a balancing act. Keeping nearby addresses in the same row lets us reuse an open row; spreading them out keeps more banks and channels busy. And no mapping is safe from every access pattern: the wrong stride can hammer the same few banks while the rest sit idle. [7] [9]

<!-- hbm:paragraph {"id": "one-address-3", "organizationLevel": "address"} -->

At this point our 32 bytes have left their bank. Next they have to get out of the HBM stack.

<!-- hbm:section {"id": "tsvs-and-microbumps", "focus": 7} -->

## TSVs, contact pads and microbumps

<!-- hbm:paragraph {"id": "tsvs-and-microbumps-0"} -->

The dies in the HBM stack are connected by TSVs, through-silicon vias: narrow, deep holes etched through each die, lined with insulation and filled with copper. Picture thousands of tiny copper columns running straight through the silicon. Every channel needs its data, command and address wires to reach the base die this way, and a lot of TSVs carry power and ground too, so these vertical connections end up being one of the biggest parts of the design.

<!-- hbm:paragraph {"id": "tsvs-and-microbumps-1"} -->

> **Note:** **Why not wire the dies together at their edges, the way older stacked chips were bonded?**

<!-- hbm:paragraph {"id": "tsvs-and-microbumps-2"} -->

> Because edge connections scale with a die's perimeter while TSVs scale with its area, and HBM needs far more vertical connections than would fit around the edge. Edge routing would also make every path longer: across the die to the edge, down the side, and back in. Longer wires mean more resistance, capacitance and inductance to drive. TSVs go straight down, so the longest path is about as long as the HBM stack is tall.

<!-- hbm:paragraph {"id": "tsvs-and-microbumps-3"} -->

Each TSV ends in a **contact pad**, a slightly wider metal landing that tolerates a little misalignment when the dies are stacked. Between dies sit microbumps, tiny solder joints that bond one die's pads to the next die's. At these dimensions, getting thousands of joints to line up and bond reliably is the hard part.

<!-- hbm:paragraph {"id": "tsvs-and-microbumps-4"} -->

Say the top die holds our data. Its read path drives the data down through the vertical connections toward the base die. It passes through every lower die on the way, but those dies don't open any rows to let it through; the TSVs and joints are just wires. The diagram follows one representative path out of the many running in parallel. [3]

<!-- hbm:paragraph {"id": "tsvs-and-microbumps-5"} -->

The gaps between dies, and between the HBM stack and the interposer, are filled with underfill or molding compound. It protects the microbumps and holds the structure together, and it's also part of the path heat takes to get out, so its thermal properties matter as much as its mechanical ones.

<!-- hbm:section {"id": "the-base-die", "focus": 8} -->

## The base die

<!-- hbm:paragraph {"id": "the-base-die-0"} -->

The base die is the HBM stack's interface to the outside world. Four parts matter here: the PHY that talks to the processor, the TSV interfaces that talk to the core dies, the power grid that feeds the whole HBM stack, and the probe pads used for testing (more on those in packaging).

<!-- hbm:paragraph {"id": "the-base-die-1"} -->

The PHY receives command, address and write data from the processor across the interposer and hands it to the core die connections. In the other direction, it drives read data back out with enough strength and timing margin for the processor to sample it correctly. Its clocking and data strobes keep both sides agreeing on when each bit is valid, which at several Gb/s per pin is a hard problem on its own.

<!-- hbm:paragraph {"id": "the-base-die-2"} -->

The TSV interfaces are laid out in arrays, with groups assigned to particular signals and channels, and on-die routing connects them to the PHY. The power grid takes supply from the package and distributes power and ground up the HBM stack through dedicated TSVs spread across the die.

<!-- hbm:paragraph {"id": "the-base-die-3"} -->

One neat HBM3E detail: SK hynix uses a six-phase read-data-strobe scheme for the core-to-base transfer. It widens the timing margin on that internal hop while using fewer strobe TSVs. Getting more bandwidth into the same package wasn't only about the external pins; the internal transfers had to get faster too. [3]

<!-- hbm:paragraph {"id": "the-base-die-4"} -->

One thing worth keeping straight: the memory controller isn't on the base die. It lives on the processor, and it decides which commands to send and when. The base die receives those commands and carries them out.

<!-- hbm:section {"id": "the-interposer", "focus": 9} -->

## The silicon interposer

<!-- hbm:paragraph {"id": "the-interposer-0"} -->

HBM uses 2.5D packaging: the HBM stack sits beside the processor on a shared base rather than on top of it. Putting memory directly on a compute die would mean running TSVs through the logic and parking the DRAM on its hottest surface, which would cause heat and reliability problems.

<!-- hbm:paragraph {"id": "the-interposer-1"} -->

The **silicon interposer** is what makes the side-by-side layout work. It's a thin slice of silicon with metal wiring layers on top, connecting the HBM stack to the processor, and TSVs through it, connecting both to the package substrate below. Because it's patterned with chip fabrication tools rather than PCB processes, its traces can sit far closer together. That routing density is the entire reason a 1,024-bit interface per HBM stack is possible.

<!-- hbm:paragraph {"id": "the-interposer-2"} -->

The base die's I/O connects through thousands of microbumps to these traces, which carry data, commands and addresses between processor and HBM stack. Reads travel out of the HBM stack and across to the processor, while writes travel the other way on the same data pins. Since the pins are shared, we never get the quoted bandwidth in both directions at once, and every switch between reading and writing costs a few idle cycles. For a read, the HBM drives the data pins; for a write, the GPU does. Switching means one end stops driving, the wires settle, and the other end starts, and no data moves while that happens.

<!-- hbm:paragraph {"id": "the-interposer-3"} -->

Keeping the memory and processor as separate dies also means each can be built and tested separately, and defects caught before final assembly. Both are hard to make, so that matters a lot. A full silicon interposer isn't the only way to do this; packages also use [redistribution-layer interposers](https://3dfabric.tsmc.com/english/dedicatedFoundry/technology/cowos.htm) and [small local silicon bridges](https://3dfabric.tsmc.com/english/dedicatedFoundry/technology/cowos.htm). [5]

<!-- hbm:paragraph {"id": "the-interposer-4"} -->

That's the whole trip for one read: capacitor, sense amplifier, column decoder, burst, TSVs, base die, interposer, GPU. On the GPU side, the bytes land in its memory system and are handed to the load that asked for them. (If a cache had already held that data, none of this trip would have happened.) A write makes the same trip in reverse and ends in the selected columns of an open row, and the controller has to give the write time to finish before it closes that row. Here's the whole read path:

<!-- hbm:figure {"id": "the-interposer-figure-5", "type": "read-path"} -->

<!-- hbm:paragraph {"id": "the-interposer-6"} -->

We've now followed one 32-byte read from a capacitor all the way to the GPU. Time to zoom back out to the whole HBM stack and ask two questions: how many bytes per second can it move, and how many can it hold? Both answers come from numbers we've already met: pins, pin rate and dies.

<!-- hbm:section {"id": "bandwidth", "focus": 10} -->

## Pins, bandwidth and capacity

<!-- hbm:paragraph {"id": "bandwidth-0"} -->

An HBM stack's pins come in several kinds: data, address, command, power. Only the data pins set bandwidth: peak bandwidth is the number of data pins times the bit rate per pin.

<!-- hbm:figure {"id": "bandwidth-figure-1", "type": "equation", "lines": ["\\begin{aligned}\nB_{\\text{peak}} &= N_{\\text{data}} \\times r_{\\text{pin}} \\\\\n&= \\frac{1024 \\times 9.6 \\times 10^{9}\\ \\text{bit/s}}{8} = 1.2288\\ \\text{TB/s}\n\\end{aligned}"], "note": "Theoretical aggregate data-interface rate for this operating point, before utilization losses. Decimal GB/s and TB/s throughout."} -->

<!-- hbm:paragraph {"id": "bandwidth-2"} -->

9.6 Gb/s per pin is an HBM3E operating point published by SK hynix. The quoted rate already counts both clock edges, so there's no extra ×2 for DDR. This is a ceiling: refresh, row misses, read/write turnarounds and bank conflicts all eat into it. [4]

<!-- hbm:paragraph {"id": "bandwidth-3"} -->

Capacity has three levers: denser dies, more dies per HBM stack, or more HBM stacks. With 24Gb core dies, an eight-high HBM stack holds 24 GB and a twelve-high HBM stack holds 36 GB. The base die isn't counted in the eight or twelve. [1]

<!-- hbm:paragraph {"id": "bandwidth-4"} -->

These levers don't do the same thing. Going from eight-high to twelve-high adds 50% more storage behind the same 1,024 pins: more capacity, same bandwidth. Adding a whole second HBM stack is different: it brings its own 1,024 data pins, so it adds bandwidth as well as capacity, but only if the GPU has a second memory interface (its own PHY and interposer wiring) to connect them to.

<!-- hbm:paragraph {"id": "bandwidth-5"} -->

The ratio of capacity to bandwidth is worth computing, because it's the minimum time to touch every byte in the HBM stack once. For the twelve-high HBM stack, $36\ \text{GB} \div 1.2288\ \text{TB/s} \approx 29\ \text{ms}$. Go back to the intro: if a model's weights fill the memory, that sweep time is roughly the floor on time per decoded token. Adding layers makes the HBM stack bigger without making it faster to read, so this number gets worse. Whether that matters depends on reuse: a workload that keeps data in SRAM doesn't care, but decode at small batch sizes rereads everything every step.

<!-- hbm:figure {"id": "bandwidth-figure-6", "type": "equation", "lines": ["\\begin{aligned}\nt_{\\text{sweep}} &= \\frac{\\text{capacity}}{\\text{bandwidth}} \\\\\n\\text{12-high:}\\quad \\frac{36\\ \\text{GB}}{1.2288\\ \\text{TB/s}} &\\approx 29.3\\ \\text{ms} \\\\\n\\text{8-high:}\\quad \\frac{24\\ \\text{GB}}{1.2288\\ \\text{TB/s}} &\\approx 19.5\\ \\text{ms}\n\\end{aligned}"], "note": "Time to read every byte once at peak bandwidth. Real sweeps are slower."} -->

<!-- hbm:section {"id": "power", "focus": 11} -->

## The dark looming hand of Power

<!-- hbm:paragraph {"id": "power-0"} -->

So why not keep pulling these levers forever? Power. Every watt the HBM burns is a watt the accelerator can't spend on compute, and all of it turns into heat that has to escape through thinned silicon and underfill, sitting right next to a 700 W processor. [18]

<!-- hbm:paragraph {"id": "power-1"} -->

Heat feeds back into bandwidth directly. DRAM leaks faster when it's hot, so above about 85°C the refresh rate typically doubles, and every refresh is time the banks can't serve requests. A hotter HBM stack is a slower one. On top of that, there are hard limits on package area, HBM stack height, cost and assembly yield. [7]

<!-- hbm:paragraph {"id": "power-2"} -->

HBM power goes to many places: leakage and background, refresh, row activation and sensing, internal data movement, clocking and I/O. Let's focus on just one: the energy to move a bit across one part of the path. Transfer power is bandwidth × energy per bit, with bandwidth as the bits actually moved per second. [8]

<!-- hbm:figure {"id": "power-figure-3", "type": "equation", "lines": ["\\begin{aligned}\nP_{\\text{transfer}} &= B_{\\text{actual}} \\times E_{\\text{bit}} \\\\\nP_{\\text{switch}} &\\approx \\alpha \\, N \\, C_{\\text{pin}} \\, V^{2} \\, r \\\\\nE_{\\text{bit}} = \\frac{P_{\\text{switch}}}{N \\, r} &\\approx \\alpha \\, C_{\\text{pin}} \\, V^{2}\n\\end{aligned}"], "note": "A simplified capacitive I/O model at full utilization. α captures switching activity; r is bit rate per pin. This is not a model of total stack power."} -->

<!-- hbm:paragraph {"id": "power-4"} -->

Careful here: $\alpha N C_{\text{pin}} V^2 r$ is power. Divide by the bit rate $N r$ to get energy per bit, and the rate cancels. So in this simple model, doubling the pins and halving the rate keeps bandwidth constant but doesn't change energy per bit at all.

<!-- hbm:paragraph {"id": "power-5"} -->

The model hides where the savings really come from. Each extra pin brings its own circuitry and background draw, which counts against going wide. But a slower pin has more time per bit, so its drivers can be weaker, its receivers simpler, its timing looser, and its voltage lower. Cpin also drops, because a short interposer trace has far less capacitance than a PCB trace. Those second-order effects are where the 3x energy-per-bit advantage over GDDR5 came from. [15]

<!-- hbm:paragraph {"id": "power-6"} -->

Why not just lower the voltage? Two reasons. Transistors switch more slowly at lower voltage, which caps the speed of every circuit on the path. And a smaller swing means less signal margin, so thermal noise, crosstalk, supply noise and jitter start causing bit errors. Voltage is pinned between speed on one side and error rate on the other.

<!-- hbm:paragraph {"id": "power-7"} -->

That's also why small voltage changes are worth fighting for. Because of the $V^2$ term, a 5% reduction cuts switching energy by $1 - 0.95^2 = 9.75\%$, with everything else held fixed. That's switching energy only; the rest of the HBM stack's power has to be accounted for separately.

<!-- hbm:section {"id": "packaging", "focus": 12} -->

## Packaging all of this

<!-- hbm:paragraph {"id": "packaging-0"} -->

Packaging is where yield goes to die. Bonding even two dies means getting alignment, temperature, time and pressure right for thousands of microbumps at once; a bad joint can crack, open up or never conduct in the first place. Every material in the HBM stack also has to be chosen for how heat moves through it.

<!-- hbm:paragraph {"id": "packaging-1"} -->

Now fit twelve core dies where there used to be eight. For its 12-layer HBM3E, SK hynix made each DRAM die 40% thinner, so the HBM stack stays the same height as its eight-layer part while holding 50% more. Thinning happens before stacking: the back of each finished wafer is ground and polished away until the dies are only a few tens of micrometres thick, thinner than a human hair. Thinner dies are also more fragile, so SK hynix changed how the gaps between them get filled too, injecting the filler for the whole HBM stack in one step (it calls this MR-MUF) so the dies stay supported and heat still gets out. More layers means changing how each layer is made, not just stacking more of them. [4]

<!-- hbm:paragraph {"id": "packaging-2"} -->

Stacking also compounds failure. If each die-and-bond step succeeds with probability $y$, a stack of $n$ dies works with probability roughly $y^n$. At an illustrative 99% per step, a twelve-high HBM stack yields $0.99^{12} \approx 89\%$; at 98%, it's $0.98^{12} \approx 79\%$. One bad die ruins every good die bonded to it.

<!-- hbm:figure {"id": "packaging-figure-3", "type": "equation", "lines": ["\\begin{aligned}\nY_{\\text{stack}} &\\approx y^{n} \\\\\n0.99^{12} &\\approx 0.886 \\\\\n0.98^{12} &\\approx 0.785\n\\end{aligned}"], "note": "Illustrative per-step yields, not vendor numbers. Real stacks also lose yield in final assembly."} -->

<!-- hbm:paragraph {"id": "packaging-4"} -->

That's why testing before stacking matters so much. Probe pads on each die let test equipment reach it while it's still on the wafer, either running its **built-in self-test** (BIST) or driving external tests. Spare rows, columns and connections can replace faulty ones instead of scrapping the die. Only known good dies, ones that pass or can be repaired, get stacked, and the finished HBM stack is tested again because bonding can break things too.

<!-- hbm:paragraph {"id": "packaging-5"} -->

None of this can be designed in isolation. Power delivery, the memory floorplan, TSV placement and hotspots all constrain each other. Finer-pitch connections and hybrid bonding, which joins dies copper-to-copper without solder bumps, are the obvious next step for the vertical path. They won't shorten the sideways trip from the HBM stack to the processor, though.

<!-- hbm:section {"id": "wrapping-up", "focus": 13} -->

## Wrapping up

<!-- hbm:paragraph {"id": "wrapping-up-0"} -->

That's HBM. A bit starts as charge in one capacitor, gets sensed into a row buffer, picked out by a column decoder, streamed onto 32 pins as a burst, and carried down the TSVs, through the base die and across the interposer to the GPU, with thousands of those trips running side by side across 32 pseudo-channels. Every piece of that design comes from one trade: lots of slow pins instead of a few fast ones.

<!-- hbm:paragraph {"id": "wrapping-up-1"} -->

With that picture in your head, an accelerator's spec sheet reads differently. Bandwidth is HBM stacks × pins × pin rate. Capacity is HBM stacks × dies × die density. Divide one by the other and you get how long it takes to read everything once, which is the floor under the decode example at the top. And when the next generation arrives, you'll recognise the move: HBM4 makes the same trade again, doubling each HBM stack to 2,048 data pins. [20]

<!-- hbm:sources -->
## Sources & further reading

1. [Micron: HBM3E](https://www.micron.com/products/memory/hbm/hbm3e)

   Stack capacities, external interface and channel counts.

2. [Synopsys: What Designers Need to Know About HBM3](https://www.synopsys.com/articles/hbm3-ip-dwtb.html)

   HBM2E/HBM3 channel organization, HBM3 data rates and 32-byte bursts.

3. [SK hynix: The Design Scheme Behind HBM3E](https://news.skhynix.com/en/rulebreakers-revolutions-design-scheme-elevates-hbm3e/)

   Core-to-base data movement, TSV resources and read-data strobes.

4. [SK hynix: 12-Layer HBM3E Volume Production](https://news.skhynix.com/en/sk-hynix-begins-volume-production-of-the-world-first-12-layer-hbm3e/)

   A 9.6 Gb/s operating point, 36GB capacity and a specific packaging example; September 2024.

5. [TSMC: CoWoS](https://3dfabric.tsmc.com/english/dedicatedFoundry/technology/cowos.htm)

   Silicon interposers, RDL interposers and local silicon interconnects.

6. [NVIDIA: Coalesced Global Memory Access](https://docs.nvidia.com/cuda/archive/12.8.1/cuda-c-best-practices-guide/index.html#coalesced-access-to-global-memory)

   Warp access coalescing and the four-transaction, 128-byte example.

7. [Kevin K. Chang: Understanding and Improving the Latency of DRAM-Based Memory Systems](https://research.ece.cmu.edu/safari/thesis/kchang_dissertation.pdf)

   DRAM cells, activation, sensing, restoration, precharge and refresh.

8. [Micron: DRAM Power Calculators](https://www.micron.com/sales-support/design-tools/dram-power-calculator)

   Workload-dependent DRAM power accounting. This article's calculators are illustrative, not Micron power models.

9. [Synopsys: HBM3 Controller IP](https://www.synopsys.com/designware-ip/interface-ip/hbm/hbm3-controller.html)

   Command scheduling, refresh, page policy and timing-aware controller responsibilities.

10. [Williams, Waterman & Patterson: Roofline](https://doi.org/10.1145/1498765.1498785)

    The relationship between arithmetic intensity, bandwidth and compute throughput.

11. [Samsung: 8-Gigabit LPDDR4 Mobile DRAM (December 2014)](https://news.samsung.com/global/samsung-electronics-starts-mass-production-of-industrys-first-8-gigabit-lpddr4-mobile-dram)

    A historical 3.2 Gb/s-per-pin LPDDR4 example, lower operating voltage and low-swing signaling.

12. [Samsung: 8-Gigabit GDDR5 Graphics DRAM (January 2015)](https://news.samsung.com/global/samsung-electronics-starts-mass-producing-industrys-first-8-gigabit-graphics-dram-gddr5)

    A historical x32 GDDR5 chip at 8 Gb/s per data pin; 32 GB/s peak per chip.

13. [SK hynix: HBM: Memory Solution for Bandwidth-Hungry Processors (Hot Chips 2014)](https://old.hotchips.org/wp-content/uploads/hc_archives/hc26/HC26-11-day1-epub/HC26.11-3-Technology-epub/HC26.11.310-HBM-Bandwidth-Kim-Hynix-Hot%20Chips%20HBM%202014%20v7.pdf)

    Early HBM: a 1,024-bit interface at 1–2 Gb/s per pin, and the bandwidth, power and packaging motivation.

14. [Synopsys: Which DDR SDRAM Memory to Use and When](https://www.synopsys.com/dw/doc.php/wp/which_DDR_SDRAM_memory_to_use_and_when_LI.pdf)

    Different DRAM design goals, LPDDR4 channels and low-power states, and GDDR5 width and 8n prefetch.

15. [AMD: Radeon R9 Fury X and the First HBM Graphics Family (June 2015)](https://ir.amd.com/news-events/press-releases/detail/619/amd-ushers-in-a-new-era-of-pc-gaming-with-radeontm-r9-and-r7-300-series-graphics-line-up-including-worlds-first-graphics-family-with-revolutionary-hbm-technology)

    HBM's first graphics product, with bandwidth-per-watt (35+ vs 10.66 GB/s/W) and board-area comparisons against GDDR5.

16. [CMU-SAFARI: Ramulator HBM3 Organization and Timing Model](https://github.com/CMU-SAFARI/ramulator2/blob/main/python/ramulator/dram/hbm3.py)

    A concrete HBM3 model with pseudo-channel, SID, bank-group and bank selection, plus timing constraints at those levels. It is not a universal physical die layout.

17. [Synopsys: DDR4 Bank Groups in Embedded System Applications](https://www.synopsys.com/articles/ddr4-bank-groups.html)

    The general reason for bank groups: overlapping slower internal column work and the distinction between same-group and different-group access timing. The HBM3-specific timing example is source 16.

18. [Glenn Klockwood: NVIDIA H100](https://glennklockwood.com/garden/processors/H100)

    H100 SXM5 specifications: 3.35 TB/s from five HBM3 stacks, 989 dense BF16 TFLOPS, 700 W.

19. [Luo et al.: Dissecting the NVIDIA Hopper Architecture through Microbenchmarking](https://arxiv.org/abs/2501.12084)

    Measured global memory latency on Hopper (about 656 cycles on H800 PCIe) via pointer chasing.

20. [JEDEC: HBM4 Standard (JESD270-4), April 2025](https://www.hpcwire.com/off-the-wire/jedec-releases-hbm4-standard-to-advance-ai-and-hpc-memory/)

    2,048-bit interface, 32 channels, up to 8 Gb/s per pin and 2 TB/s per stack.
