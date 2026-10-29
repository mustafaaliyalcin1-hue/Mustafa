# Tepetaklak trailer track: 128 BPM, A minor, synthesized from scratch (no samples).
import numpy as np, wave
SR=44100; BPM=128; beat=60/BPM; bar=beat*4; DUR=42.0
N=int(SR*DUR); L=np.zeros(N); R=np.zeros(N)
rng=np.random.default_rng(7)
def t_(d): return np.arange(int(SR*d))/SR
def add(buf,sig,at,gain=1.0):
    i=int(at*SR); j=min(N,i+len(sig))
    if i<N: buf[i:j]+=sig[:j-i]*gain
def both(sig,at,g=1.0,pan=0.0):
    add(L,sig,at,g*(1-max(0,pan))); add(R,sig,at,g*(1+min(0,pan)))
def lp(x,cut):
    a=np.exp(-2*np.pi*cut/SR); m=int(np.ceil(np.log(1e-4)/np.log(a)))+1
    k=(1-a)*a**np.arange(m); return np.convolve(x,k)[:len(x)]
def saw(f,d,detune=0): t=t_(d); return 2*((t*f*(1+detune))%1)-1
def note(n): return 440*2**((n-69)/12)
# drums
def kick():
    t=t_(.45); f=45+110*np.exp(-t*28); ph=2*np.pi*np.cumsum(f)/SR; return np.sin(ph)*np.exp(-t*7)*1.0+np.sin(ph*.5)*np.exp(-t*4)*.3
def snare():
    t=t_(.3); n=rng.standard_normal(len(t)); n=n-lp(n,1800); return (n*np.exp(-t*16)*.55+np.sin(2*np.pi*190*t)*np.exp(-t*25)*.5)
def hat(op=False):
    t=t_(.25 if op else .06); n=rng.standard_normal(len(t)); n=n-lp(n,7000); return n*np.exp(-t*(14 if op else 70))*.22
K,SN,HC,HO=kick(),snare(),hat(),hat(True)
chords=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]  # Am F C G
bassn=[45,41,36,43]
def section_drums(t0,bars,full=True):
    for b in range(bars):
        for q in range(4):
            at=t0+b*bar+q*beat
            both(K,at,.95)
            if q in (1,3) and full: both(SN,at,.7)
            both(HC,at+beat/2,.6,pan=.3)
            if full and q%2==1: both(HO,at+beat*0.75,.35,pan=-.3)
# side-chain envelope from kicks
def pump(t0,t1):
    env=np.ones(N); 
    tt=np.arange(int(SR*beat))/SR; shape=1-0.75*np.exp(-tt*9)
    k=t0
    while k<t1:
        i=int(k*SR); j=min(N,i+len(shape)); env[i:j]=shape[:j-i]; k+=beat
    return env
pad=np.zeros(N); bass=np.zeros(N); lead=np.zeros(N)
def pad_section(t0,bars,amp=.18,cut=1400):
    for b in range(bars):
        ch=chords[b%4]; d=bar
        s=sum(saw(note(n),d,dt) for n in ch for dt in (-.004,.004))/6
        env=np.minimum(1,t_(d)/.25)*np.minimum(1,(d-t_(d))/.3+.2)
        s=lp(s*env,cut); add(pad,s,t0+b*bar,amp)
def bass_section(t0,bars):
    for b in range(bars):
        n=bassn[b%4]
        for e in range(8):
            d=beat/2; s=saw(note(n+ (12 if e%4==3 else 0)),d*.9); s=lp(s,900)*np.exp(-t_(d*.9)*5)
            add(bass,s,t0+b*bar+e*d,.5)
arp=[0,7,12,15,12,7,3,7]
def lead_section(t0,bars,amp=.11):
    for b in range(bars):
        root=chords[b%4][0]+12
        for e in range(16):
            d=beat/4; n=root+arp[e%8]; t=t_(d*.95); s=np.sign(np.sin(2*np.pi*note(n)*t))*np.exp(-t*9)
            add(lead,lp(s,3500),t0+b*bar+e*d,amp)
# arrangement (bar = 1.875 s)
B=lambda x:x*bar
pad_section(0,2,.16,900)                         # intro 0-3.75
riser_t=t_(B(2)); r=rng.standard_normal(len(riser_t)); r=r-lp(r,1500); add(pad,r*(riser_t/riser_t[-1])**3*.07,0)
section_drums(B(2),8); bass_section(B(2),8); pad_section(B(2),8,.14,2200); lead_section(B(6),4)   # drop 1
pad_section(B(10),2,.2,700); section_drums(B(11),1,False)                                          # break
section_drums(B(12),8); bass_section(B(12),8); pad_section(B(12),8,.15,2600); lead_section(B(12),8,.13)  # drop 2
end=B(20); both(K,end,1.1); both(SN,end,.8)
# final chord with tail
s=sum(saw(note(n),4,dt) for n in [45,57,60,64,69] for dt in (-.003,.003))/10; s=lp(s*np.exp(-t_(4)*1.1),1800); add(pad,s,end,.35)
env=pump(B(2),B(20))
L+= (pad+bass)*env + lead*0.9; R+=(pad+bass)*env + lead*1.0
# simple stereo reverb (feedback delays)
for buf,ds in ((L,[0.0297,0.0371,0.0411,0.0437]),(R,[0.0313,0.0353,0.0427,0.0451])):
    wet=np.zeros(N)
    for d in ds:
        k=int(d*SR); y=buf.copy()*.0
        x=buf*.25
        for rep in range(6): 
            sh=k*(rep+1); 
            if sh<N: wet[sh:]+=x[:N-sh]*(.55**rep)
    buf+=lp(wet,4000)*.35
# fade, master
fade=np.ones(N); fi=int(.3*SR); fade[:fi]=np.linspace(0,1,fi); fo=int(1.5*SR); fade[-fo:]=np.linspace(1,0,fo)
L*=fade; R*=fade
m=max(np.abs(L).max(),np.abs(R).max()); L=np.tanh(L/m*1.4)/np.tanh(1.4)*.92; R=np.tanh(R/m*1.4)/np.tanh(1.4)*.92
out=(np.stack([L,R],1)*32767).astype('<i2')
w=wave.open('muzik.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes()); w.close()
print('ok',DUR,'s', 'bar',bar)
