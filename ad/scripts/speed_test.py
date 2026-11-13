import sys,os,math,time; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import bpy, mathutils; from lib_phone import *
eng,spp=sys.argv[-3],int(sys.argv[-2]); out=sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
cam=studio(engine=eng,w=1920,h=1080,samples=spp); P=load_fold8()
P['set_angle'](95); P['root'].rotation_euler=(0,0,math.radians(-45)); bpy.context.view_layer.update()
pts=[o.matrix_world@mathutils.Vector(c) for o in P['meshes'] for c in o.bound_box]; c=sum(pts,mathutils.Vector())/len(pts)
look_at(cam,c,0.55,-20,25)
for i in range(2):
    bpy.context.scene.render.filepath=out; t=time.time(); bpy.ops.render.render(write_still=True); print('T',eng,spp,round(time.time()-t,1))
