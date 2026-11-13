import sys,os,math,time; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import bpy, mathutils; from lib_phone import *
bpy.ops.wm.read_factory_settings(use_empty=True)
cam=studio(engine='CYCLES',w=1920,h=1080,samples=24); P=load_fold8()
out=sys.argv[-1]
shots=[(165,(0,0,-18),0.50,-8,6,(0,0,0)),(0,(0,0,155),0.40,20,12,(0,0,0)),(100,(0,0,-40),0.52,-25,22,(0,0,0))]
for i,(a,rot,dist,az,el,_) in enumerate(shots):
    P['set_angle'](a); P['root'].rotation_euler=[math.radians(v) for v in rot]; bpy.context.view_layer.update()
    pts=[o.matrix_world@mathutils.Vector(c) for o in P['meshes'] if not o.hide_render for c in o.bound_box]; c=sum(pts,mathutils.Vector())/len(pts)
    look_at(cam,c,dist,az,el); bpy.context.scene.render.filepath=f'{out}_{i}.png'; t=time.time(); bpy.ops.render.render(write_still=True); print('T',i,round(time.time()-t,1))
