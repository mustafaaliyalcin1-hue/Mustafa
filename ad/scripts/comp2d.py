# 2D kompozisyon: stüdyo zemini, bulanık hayalet kelime, temas gölgesi, render, süper, HUD hap
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
FD=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),'fonts')
def F(w,s): return ImageFont.truetype(f'{FD}/Inter-{w}.ttf',int(s))
def studio_bg(w,h,c_in=(0xD6,0xC9,0xE8),c_out=(0xA6,0x98,0xC2)):
    y,x=np.mgrid[0:h,0:w]; r=np.sqrt(((x-w*0.5)/(w*0.8))**2+((y-h*0.42)/(h*0.9))**2); r=np.clip(r,0,1)**1.4
    return np.array(c_in,float)*(1-r[...,None])+np.array(c_out,float)*r[...,None]
def ghost(base,word,alpha=0.30,blur=0.012,y=0.5):
    h,w=base.shape[:2]; L=Image.new('L',(w,h),0); d=ImageDraw.Draw(L); s=h*0.62
    f=F(700,s); tw=d.textlength(word,font=f)
    if tw>w*1.15: f=F(700,s*w*1.15/tw)
    d.text((w/2,h*y),word,font=f,fill=255,anchor='mm'); a=np.asarray(L.filter(ImageFilter.GaussianBlur(h*blur))).astype(float)/255*alpha
    return base*(1-a[...,None])+255*a[...,None]
def over(base,rgba,shadow=0.30,sh_off=0.025,sh_blur=0.03):
    im=np.asarray(rgba).astype(float); h,w=im.shape[:2]; a=im[...,3:4]/255
    al=Image.fromarray(im[...,3].astype(np.uint8)).filter(ImageFilter.GaussianBlur(h*sh_blur)); sh=np.asarray(al).astype(float)/255
    k=int(h*sh_off); sh=np.concatenate([np.zeros((k,w)),sh[:-k]],0) if k else sh
    base=base*(1-shadow*sh[...,None]*np.array([0.95,1.0,0.85]))
    return im[...,:3]*a+base*(1-a)
def to_img(a): return Image.fromarray(np.clip(a,0,255).astype(np.uint8))
def super_text(img,text,y=0.82,size=0.062,weight=700,color=(255,255,255),x=0.5,anchor='mm',shadow=True):
    w,h=img.size; f=F(weight,h*size)
    if shadow:
        S=Image.new('RGBA',img.size,(0,0,0,0)); ImageDraw.Draw(S).text((w*x,h*y+h*0.004),text,font=f,fill=(60,40,90,90),anchor=anchor); img.alpha_composite(S.filter(ImageFilter.GaussianBlur(h*0.006)))
    T=Image.new('RGBA',img.size,(0,0,0,0)); ImageDraw.Draw(T).text((w*x,h*y),text,font=f,fill=color+(255,) if len(color)==3 else color,anchor=anchor); img.alpha_composite(T)
def hud_pill(img,text,cx=0.5,cy=0.09,scale=1.0):
    w,h=img.size; O=Image.new('RGBA',img.size,(0,0,0,0)); d=ImageDraw.Draw(O); f=F(600,h*0.03*scale); tw=d.textlength(text,font=f)
    pw,ph=tw+h*0.05*scale,h*0.052*scale; x0,y0=w*cx-pw/2,h*cy-ph/2
    d.rounded_rectangle((x0,y0,x0+pw,y0+ph),radius=ph/2,outline=(255,255,255,235),width=max(1,int(h/540)),fill=(255,255,255,28))
    d.text((w*cx,h*cy),text,font=f,fill=(255,255,255,255),anchor='mm'); img.alpha_composite(O)
