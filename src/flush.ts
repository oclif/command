export = async () => {
  try {
    const {ux} = require('cli-ux')
    await ux.flush()
  } catch {}
}
