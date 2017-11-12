// TMS0102, 0103, 0105, 0109 - 8-digit calculator, 4 function (+, -, x, �) without
//     a separate equal key
//TMS0106, 0107 - 10-digit calculator, 4 function (+, -, x, �) without a separate 
//     equal key
//              _____ _____
//             |     U     |                 Keyboard Matrix: 
//  Clock in --| 1      28 |-- Vss (7.2V)         KN   KO   KP   KQ
//        KP --| 2      27 |-- KQ            D1   1         dp1
//        D1 --| 3      26 |-- KN            D2   2    x    dp2
//        D2 --| 4      25 |-- KO            D3   3    �    dp3
//        D3 --| 5      24 |-- dp            D4   4         dp4
//        D4 --| 6      23 |-- h             D5   5    +=   dp5
//        D5 --| 7      22 |-- g             D6   6    -=   dp6
//        D6 --| 8      21 |-- f             D7   7    +/-  dp7
//       D7 --| 9      20 |-- e             D8   8
//        D8 --| 10     19 |-- d             D9   9    .
//        D9 --| 11     18 |-- c            D10   0    CE   dp0  K
//       D10 --| 12     17 |-- b            D11        C
//       D11 --| 13     16 |-- a            Note: Columns KP and KQ are for
// Vdd (Gnd) --| 14     15 |-- Vgg (-7.2V)        static switches; dp# selects
//             |___________|                      a fixed decimal position; K
//                                                selects constant mode.
//        Note: D11 is used for negative-sign,
//              overflow, and error indication
//              on all variations.

;
;       Come back here to get the next key. P2, 64 on, is used to enter the data.
;

Bootloader:
    sio                                     ; D1 is connected to SIN, shift into SIN.
    lde                                     ; put E into A
    jp    Bootloader                        ; if the shifted bit was zero wait.

    dly   nn                                ; delay till near the end of the first high pulse (e.g. D1 going high->low)
    ldi   -10-1                             ; set P3.L to -11, when done 11 this will be zero.
;
;       Keyboard scanner. P3 counts up from -10 to 0  (D1 to D11) after the first two instructions here.
;
KeyScanLoop:
    xpal  p3                                ; put into P3.L
    ld    @1(p3)                            ; bump P3.L, this tracks the line being scanned.
    csa                                     ; check SA (KN line from keyboard) and SB (KO line)
    ani   030h                              ; isolate SA+SB
    jnz   Keypressed                        ; if non-zero a key is pressed
    dly   mm                                ; delay to end of next high pulse (e.g D2 going high->low)
    xpal  p3                                ; have we finished ?
    jz    KeyScanLoop                       ; wait for key to be pressed.
    jmp   BootLoader                        ; scan again.
;
;   At this point a key has been pressed, P3.L (-10 to 0) indicates row (D1-D11)
;
KeyPressed:
    xpal  p3                                ; if zero, we have scanned the last row e.g. the C key.
    jz    KeyPressedC                       ; which is advance to next address (and clears the display)

    ldi   1                                 ; set F0 (KN line into chip) high, which will echo the key press 1-9.
    cas 
    dly   mm                                ; delay till the pulse changes again.
    cas                                     ; set F0 low and clear carry.

    xpal  p3                                ; -10 = 1 upwards.
    adi   10                                ; 1-8 represent 0-7.
    xae                                     ; put in E.

    lde                                     ; 9 would be 8, if this bit is set, then goto $40 (so '9' is the start)
    ani   08
    jnz   64

    ld    64(p2)                            ; read current updating byte
    rr                                      ; rotate right 3 times.
    rr
    rr
    ani   0F7h                              ; zero lower 3 bits
    ore                                     ; or key press in.
    st    64(p2)                            ; write back and get next key.
    jp    BootLoader
;
;   The C key has been pressed
;
KeyPressedC:
    ldi   2                                 ; set F1 (KO) line into chip, operating C key
    cas
    dly   mm
    cas

    ld   @1(p2)                             ; bump write address to next memory slot.
    jmp   BootLoader                        ; and go round again.


; =========================================================================================================================

    ldi   Interrupt-1                       ; P3 points to the interrupt routine.
    xpal  p3
WaitD1:
    sio                                     ; shift D1 into E bit 7
    lde                                     ; copy into A
    jp    WaitD1                            ; keep going till D1 pressed.
    dly   nn                                ; delay till 50% of the on type on D1.
    ldi   -10                               ; scan a maximum of 10 times, from D1-D10
WaitSA:    
    xpal  p2                                ; counter in P2.L
    ld    @1(p2)                            ; increment P2.L
    ien                                     ; will cause interrupt when SA (KN) goes high now.
    nop                                     ; because of the 1-instruction delay.
    dint                                    ; disable interrupt again.
    dly   mm                                ; delay to the middle of the next instruction.
    xpal  p2                                ; look at P2.
    jnz   WaitSA                            ; go back if not done.
