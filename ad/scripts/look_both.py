import sys,os,math,time; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import bpy, mathutils; from lib_phone import *
bpy.ops.wm.read_factory_settings(use_empty=True)
cam=studio(engine='CYCLES',w=1920,h=1080,samples=24)
U=load_phone('U'); F=load_phone('F8')
out=sys.argv[-1]
def frame_all(objs,dist,az,el):
    bpy.context.view_layer.update(); pts=[o.matrix_world@mathutils.Vector(c) for P in objs for o in P['meshes'] if not o.hide_render for c in o.bound_box]
    c=sum(pts,mathutils.Vector())/len(pts); look_at(cam,c,dist,az,el)
# 0: ikisi yan yana, önden açık
U['set_angle'](175); F['set_angle'](175)
U['root'].location=(-0.085,0,0); U['root'].rotation_euler=(0,0,math.radians(-12))
F['root'].location=(0.095,0.02,-0.012); F['root'].rotation_euler=(0,0,math.radians(-12))
frame_all([U,F],0.62,-8,6)
bpy.context.scene.render.filepath=f'{out}_0.png'; t=time.time(); bpy.ops.render.render(write_still=True); print('T0',round(time.time()-t,1))
# 1: ikisi kapalı, arkadan
U['set_angle'](0); F['set_angle'](0)
U['root'].location=(-0.03,0,0); U['root'].rotation_euler=(0,0,math.radians(170))
F['root'].location=(0.07,0.03,-0.017); F['root'].rotation_euler=(0,0,math.radians(165))
frame_all([U,F],0.48,15,10)
bpy.context.scene.render.filepath=f'{out}_1.png'; t=time.time(); bpy.ops.render.render(write_still=True); print('T1',round(time.time()-t,1))
# 2: Ultra yarı açık, kitap gibi
F['root'].location=(5,5,5)
U['set_angle'](100); U['root'].location=(0,0,0); U['root'].rotation_euler=(0,0,math.radians(-40))
frame_all([U],0.50,-22,20)
bpy.context.scene.render.filepath=f'{out}_2.png'; t=time.time(); bpy.ops.render.render(write_still=True); print('T2',round(time.time()-t,1))
