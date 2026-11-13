# RGBA render'ı lavanta stüdyo zeminine yerleştir (radyal degrade + yumuşak temas gölgesi)
import sys, numpy as np
from PIL import Image, ImageFilter
def bg(w,h,c_in=(0xD8,0xCC,0xE8),c_out=(0xA8,0x9A,0xC4)):
    y,x=np.mgrid[0:h,0:w]; r=np.sqrt(((x-w*0.5)/(w*0.75))**2+((y-h*0.45)/(h*0.85))**2); r=np.clip(r,0,1)**1.3
    a=np.array(c_in,float); b=np.array(c_out,float); return (a*(1-r[...,None])+b*r[...,None])
def comp(rgba,shadow=0.35):
    im=np.asarray(rgba).astype(float)/255; h,w=im.shape[:2]; B=bg(w,h)/255
    al=Image.fromarray((im[...,3]*255).astype(np.uint8)); sh=np.asarray(al.filter(ImageFilter.GaussianBlur(w/60))).astype(float)/255
    k=int(h*0.03); sh=np.concatenate([np.zeros((k,w)),sh[:-k]],0); B=B*(1-shadow*sh[...,None]*np.array([1,1.02,0.9]))
    o=im[...,:3]*im[...,3:4]+B*(1-im[...,3:4]); return Image.fromarray((np.clip(o,0,1)*255).astype(np.uint8))
if __name__=='__main__':
    ins=sys.argv[1:-1]; out=sys.argv[-1]; ims=[comp(Image.open(p).convert('RGBA')) for p in ins]
    w,h=ims[0].size; W=Image.new('RGB',(w,h*len(ims)));[W.paste(im,(0,i*h)) for i,im in enumerate(ims)]; W.save(out)
