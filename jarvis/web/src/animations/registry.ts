/**
 * ANİMASYON KAYIT SİSTEMİ (registry)
 * ---------------------------------------------------------------
 * Yeni bir konu animasyonu eklemek için:
 *   1) animations/scenes/ altına bir React bileşeni yaz: ({ data }) => JSX
 *   2) Aynı dosyada registerScene({...}) çağır
 *   3) animations/index.ts dosyasına import satırını ekle
 * Hepsi bu. Backend'deki her tool, sonucunu `{type:'scene', scene:'<id>', data}`
 * olarak gönderir; arayüz burada kayıtlı bileşeni oynatır. Bilinmeyen bir
 * kimlik gelirse 'generic' (işlem yapılıyor) sahnesine düşülür.
 */
import type { ComponentType } from 'react'

export interface SceneProps<T = unknown> {
  data: T
  /** Düşük performans modunda efektleri azalt */
  low: boolean
}

export interface SceneDef<T = any> {
  id: string
  title: string
  /** Galeri gruplaması */
  category: 'Temel' | 'Bilgi' | 'Araçlar' | 'Ev' | 'Diğer'
  /** Hangi backend tool'ları bu sahneyi kullanır (dokümantasyon amaçlı) */
  tools?: string[]
  component: ComponentType<SceneProps<T>>
  /** Sahnenin en az ekranda kalma süresi (ms) */
  minDuration?: number
  /** Galeri ve demo için örnek veriler (varyantlar) */
  demo?: { label: string; data: T; say?: string }[]
}

const scenes = new Map<string, SceneDef>()

export function registerScene<T>(def: SceneDef<T>) {
  scenes.set(def.id, def as SceneDef)
}

export function getScene(id: string): SceneDef {
  return scenes.get(id) || scenes.get('generic')!
}

export function listScenes() {
  return [...scenes.values()]
}
