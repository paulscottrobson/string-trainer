
;
;	Wait for D1 to go to logic 1.
;		
waitD1:	sio 						; put D1 into E:7
		lde 						; into A
		jp 		waitD1 				; if value read zero, wait (e.g. until up on D1)
;
;	E 7:4 contains the identity of the current key being scanned. 0x50 == D1. 0xF0 == D11.
;
		ldi 	0x50 				; so 11 scans in total.
		st 		16(p1)				; clear current key (this value means no key pressed).
;
;	Main loop - nxt scan.
;		
scan:
		xae 						; put back in E.
		cas 						; zero the 'key in' bits e.g. no key being pressed now.
;
;	Check to see if we are on the right key for the next output.
;
		ld 		0(p1) 				; look at head of queue for next to output.
		ani 	0F0h 				; bits 4-7 are the line to set, bits 0-1 set KN, KP lines on IC chip in, 2 and 3 are zero.
		xre
		jnz 	NoSetBit			
;
;	Yes, so set those bits (F0,F1) from this value.
;		
		ld 		0(p1)				; get the bits to set.
		cas 						; write it out.
;
;	Check if SA or SB is pressed.
;		
NoSetBit:
		csa 						; check if key pressed
		ani 	30h 
		jz 		NoKeyPressed 			
;
;	If so put byte r3 r2 r1 r0 sb sa 0 0 in keyboard buffer.
;		
		sr 							; shift into bits SB and SA into bits 3 and 2
		sr
		ore 						; or the current line value (upper 4 bits of E)
		st 		16(p1) 				; save in current key storage
;
;	Done output and input. Wait through the next high-low transition to the start of the next, zero the keys pressed.
;		
NoKeyPressed:
		dly 	<cycle> 			; wait until the start of the next key
		cas 						; turn any key bits set off (presume set on hi->low transition of D line)
;
;	Go to next row.
;		
		lde 						; also clears cy/l
		adi 	0x10 				; next row scanning.
		jnz 	scan 
