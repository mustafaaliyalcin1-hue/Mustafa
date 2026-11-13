# Faz 1 animatik: teslim zamanlaması (1.2x). Film = gerçek kaynak (25fps*1.2 = 30fps, kare kaybı yok), 3D = yer tutucu.
import subprocess, os, numpy as np
from PIL import Image, ImageDraw, ImageFont
SRC='../source/samsung_film.mp4'; T='build/animatic'; os.makedirs(T,exist_ok=True)
W,H=960,540; F700='fonts/Inter-700.ttf'; F400='fonts/Inter-400.ttf'
SH=[ # id, teslim in, out, tür, kaynak in, kırpma(1280 koord) / still, süper
 ('S1',0.00,1.96,'3d',1.0,'Galaxy Z Fold8 Ultra','3D: yarı açık → KLİK 0.26 → 90° 0.65 → SNAP 180° 1.04'),
 ('S2',1.96,2.83,'film',4.75,None,'Ultra açılıyor.'),
 ('S3a',2.83,3.80,'film',2.40,None,''),
 ('S3b',3.80,4.79,'3d',4.2,'4,1 mm','3D: kenardan jilet çizgisi + kumpas'),
 ('S4a',4.79,5.60,'film',8.77,(0,300,690,388),'200MP Ultra kamera'),
 ('S4b',5.60,6.29,'3d',9.6,'200MP Ultra kamera','3D: lens adası, odak köşeleri (deklanşör 5.60)'),
 ('S5a',6.29,6.95,'film',7.05,None,'Ve karşınızda'),
 ('S5b',6.95,7.83,'film',10.90,None,'Ve karşınızda'),
 ('S6',7.83,8.75,'film',13.90,None,'Galaxy Z Fold8'),
 ('S7a',8.75,9.35,'film',16.60,None,''),
 ('S7b',9.35,10.10,'3d',18.0,'Yeni form açılıyor.','3D: geri çekilme, lavanta açık Fold8 ekranında'),
 ('S7c',10.10,10.83,'3d',20.4,'Dümdüz.','3D: kenardan, çizgi cetvel'),
 ('S8',10.83,12.46,'3d',23.5,'Samsung’un en hafif Fold’u','3D: sayaç 0 → 201 g, sonra iki telefon arkasını döner'),
 ('S9',12.46,14.17,'3d',25.6,'Galaxy Z Fold8 Ultra | Fold8','3D: iki telefon objektife açılır · Yepyeni açılış. · Galaxy AI'),
]
def txtfile(name,s):
    p=f'{T}/{name}.txt'; open(p,'w').write(s); return p
segs=[]
for i,(sid,a,b,kind,s0,crop,sup) in enumerate(SH):
    d=b-a; out=f'{T}/{i:02d}.mp4'; vf=[]
    if kind=='film':
        inp=['-ss',f'{s0:.3f}','-t',f'{d*1.2+0.1:.3f}','-i',SRC]
        if crop: vf.append('crop=%d:%d:%d:%d'%(crop[2],crop[3],crop[0],crop[1]))
        vf+=['setpts=PTS/1.2','fps=30',f'scale={W}:{H}:flags=lanczos','unsharp=5:5:0.5']
        label=sup
    else:
        inp=['-loop','1','-t',f'{d:.3f}','-i',f'storyboard/frames/t_{s0}.png']
        vf+=[f'scale={W}:{H}','gblur=sigma=28','eq=saturation=0.5:brightness=0.06','fps=30',
             "drawbox=x=0:y=0:w=iw:h=ih:color=0x5B3D73@0.35:t=fill",
             f"drawtext=fontfile={F400}:textfile={txtfile(sid+'n',sup)}:x=24:y=h-46:fontsize=20:fontcolor=white"]
        label=crop
    if label:
        vf.append(f"drawtext=fontfile={F700}:textfile={txtfile(sid,label)}:x=(w-tw)/2:y=h*0.80:fontsize=44:fontcolor=white:shadowcolor=0x000000@0.25:shadowx=0:shadowy=2")
    vf.append(f"drawtext=fontfile={F700}:text='{sid}':x=16:y=14:fontsize=18:fontcolor=white:box=1:boxcolor=0x000000@0.5:boxborderw=5")
    subprocess.run(['ffmpeg','-v','error','-y',*inp,'-vf',','.join(vf),'-t',f'{d:.3f}','-an','-c:v','libx264','-crf','20','-pix_fmt','yuv420p','-r','30',out],check=True)
    segs.append(out)
# Son kart: luma matte wordmark (çizim yok)
src=np.asarray(Image.open('storyboard/frames/logo_full.png').convert('L')).astype(float)[320:400,440:840]
m=Image.fromarray(np.clip((src-20)/(230-20)*255,0,255).astype(np.uint8)).resize((400*3//4*2,80*3//4*2),Image.LANCZOS)
ec=Image.new('RGB',(W,H),(239,231,248)); ink=Image.new('RGB',m.size,(42,31,51)); ec.paste(ink,((W-m.width)//2,150),m)
dr=ImageDraw.Draw(ec); f=ImageFont.truetype(F400,30); dr.text((W/2,305),'×',font=f,fill=(42,31,51),anchor='mm')
f2=ImageFont.truetype('fonts/Inter-600.ttf',52); dr.text((W/2,365),'maybeta',font=f2,fill=(42,31,51),anchor='mm')
ec.save(f'{T}/ec.png')
subprocess.run(['ffmpeg','-v','error','-y','-loop','1','-t','1.5','-i',f'{T}/ec.png','-vf','fps=30,format=yuv420p','-c:v','libx264','-crf','20','-r','30',f'{T}/99.mp4'],check=True); segs.append(f'{T}/99.mp4')
open(f'{T}/list.txt','w').write(''.join(f"file '{os.path.basename(s)}'\n" for s in segs))
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',f'{T}/list.txt','-vf',"drawtext=fontfile=fonts/Inter-400.ttf:text='%{pts\\:flt}':x=w-tw-14:y=14:fontsize=16:fontcolor=white:box=1:boxcolor=0x000000@0.5:boxborderw=4",'-c:v','libx264','-crf','24','-preset','slow','-pix_fmt','yuv420p','-movflags','+faststart','preview/faz1_animatik_540p.mp4'],check=True)
