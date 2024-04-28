<CsoundSynthesizer>
<CsOptions>
-odac     ;;;realtime audio out
</CsOptions>
<CsInstruments>

sr = 44100
ksmps = 32
nchnls = 2
0dbfs  = 1

ga1 init 0
gamix  init 0
gkdens1 init 0.8
gkdens2 init 1.1

instr 1
      kamp = 0.1 ; stochastic なので大体の値 ; 全然影響でないな
      idettack = 10.7 ; 継続時間
      inum = 2  ; 鳴る対称の数
      idamp = 1.2 ; damping_amount = 0.996 + idamp *0.002, この値が1でダンピングなし
              	  ; idamp =1 だと0.998ということ. idamp=2が最大値。作者は1.4-1.75の間の値を推奨
      imaxshake = 0.5  ;0-1の値で系に戻ってくるエネルギーの割合
      ifreq     = 300  ;450がデフォルト。800
      ifreq1    = 740  ;600がデフォルト。800
      ifreq2    = 900  ;750がデフォルト。900

      adrp dripwater kamp, idettack, inum, idamp, imaxshake, ifreq, ifreq1, ifreq2
      adam dam adrp, 100, 0.05, 2, 0.01, 0.1
      afil tone adam,1000
      asig = afil *0.05

      ;asig clip adrp*0.2, 1, 0.0011	; avoid drips that drip too loud
      ;asig = adrp *0.01
      ;kRms peak
      outs asig,asig
      gamix = gamix + asig*0.1
endin

instr 98
      arvt1 line .05*1.5, p3, 6  ; 1/1000に下がる時間, 0.05 からp3かけて6になる
      arvt2 line .05,     p3, 4
      ilpt =  .9   // loopにかかる時間
      aleft	alpass gamix, 1, ilpt
      aright	alpass gamix, 1, ilpt*2
      outs   aleft, aright

      gamix = 0	; clear mixer
endin

instr freeVerb
      aleft,aright freeverb gamix, gamix,0.9,0.0
      outs   aleft*0.1, aright*0.1
      gamix = 0	; clear mixer
endin

instr bado
      al,ar  babo    gamix*0.7, 1,2,3, 10.49,10.85,30,0.01
      outs    al,ar
      gamix=0;
endin

instr nReverb
      aoutLR nreverb gamix,0.5, 0.0
      outs aoutLR*0.1, aoutLR*0.1
      gamix=0
endin

instr RainyNess
	amixal = noise:a(1, 0) * (pinker:a() * gkdens1)
	amixbl = amixal * (pinker:a() * gkdens2)
	afinl clip amixbl, 0, 1
	
	amixar = noise:a(1, 0) * (pinker:a() * gkdens1)
	amixbr = amixar * (pinker:a() * gkdens2)
	afinr clip amixbr, 0, 1

	;kLorenz lorenz 0.005, 10, 28, 2.667  ; ローレンツアトラクタのパラメータ

	ksv init 10
	krv init 28
	kbv init 2.667
	kh init 0.0003
	ix = 0.6
	iy = 0.6
	iz = 0.6
	iskip = 1
	ax1, ay1, az1 lorenz ksv, krv, kbv, kh, ix, iy, iz, iskip
	  ; Place the basic tone within 3D space.
	kx downsamp ax1
	ky downsamp ay1
	kz downsamp az1
	idist = 1
	ift = 0
	imode = 1
	imdel = 1.018853416
	iovr = 2
	aw2, ax2, ay2, az2 spat3d afinl, kx, ky, kz, idist, ift, imode, imdel, iovr

	; Convert the 3D sound to stereo.
	aleft = aw2 + ay2
	aright = aw2 - ay2
		
	aleft *= 0.14
	aright *= 0.14
	out aleft, aright
endin

</CsInstruments>
<CsScore>
;f1 0 4096 10 1

;i98 0 100
;i"freeVerb" 0 -1
;i"bado" 0 -1
;i"nReverb" 0 -1 it"-1" does not work in WASM csound
i"nReverb" 0 10000

i"RainyNess" 0 -1
;{100 CNT 
;i1 [0.9 * $CNT] 0.3
;} 

e
</CsScore>
</CsoundSynthesizer>

