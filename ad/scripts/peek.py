import bpy, sys, mathutils, math
p=sys.argv[-2]; out=sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=p)
sc=bpy.context.scene; sc.render.engine='BLENDER_EEVEE'; sc.eevee.taa_render_samples=16
sc.render.resolution_x=1280; sc.render.resolution_y=720
for e in [o for o in bpy.data.objects if o.type=='EMPTY']:
    print('EMPTY',e.name,tuple(round(v,4) for v in e.location),tuple(round(math.degrees(v),1) for v in e.rotation_euler))
meshes=[o for o in bpy.data.objects if o.type=='MESH']
pts=[o.matrix_world@mathutils.Vector(c) for o in meshes for c in o.bound_box]
mn=mathutils.Vector([min(v[i] for v in pts) for i in range(3)]); mx=mathutils.Vector([max(v[i] for v in pts) for i in range(3)])
c=(mn+mx)/2; r=(mx-mn).length; print('BOUNDS',mn,mx)
w=bpy.data.worlds.new('w'); sc.world=w; w.use_nodes=True; w.node_tree.nodes['Background'].inputs[0].default_value=(0.8,0.75,0.9,1); w.node_tree.nodes['Background'].inputs[1].default_value=1.2
bpy.ops.object.light_add(type='AREA',location=c+mathutils.Vector((r,-r,r))); L=bpy.context.object; L.data.energy=20; L.data.size=r
L.rotation_euler=(mathutils.Vector((0,0,0))-mathutils.Vector((r,-r,r))).to_track_quat('-Z','Y').to_euler()
cam=bpy.data.objects.new('cam',bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera=cam
for i,d in enumerate([(0,-1,0.15),(0.8,-0.8,0.5),(0,1,0.15)]):
    d=mathutils.Vector(d).normalized(); cam.location=c+d*r*1.6
    cam.rotation_euler=(c-cam.location).to_track_quat('-Z','Y').to_euler()
    sc.render.filepath=out+f'_{i}.png'; bpy.ops.render.render(write_still=True)
