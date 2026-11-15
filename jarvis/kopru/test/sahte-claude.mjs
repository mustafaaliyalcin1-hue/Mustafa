// Testler için sahte "claude -p": stdin'i okur, Claude Code'un JSON çıktısını taklit eder
let girdi = ''
process.stdin.setEncoding('utf8').on('data', (d) => (girdi += d)).on('end', () => {
  if (process.env.SAHTE_MOD === 'giris') {
    console.log(JSON.stringify({ type: 'result', is_error: true, result: 'Invalid API key · Please run /login' }))
    process.exit(1)
  }
  const soru = girdi.match(/Kullanıcının yeni mesajı: (.*)/)?.[1] ?? girdi
  console.log(JSON.stringify({ type: 'result', subtype: 'success', is_error: false, result: `Bilgisayardan cevap: ${soru} [klasör: ${process.cwd().includes('jarvis-kopru-') ? 'geçici' : 'başka'}]` }))
})
