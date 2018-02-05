// tslint:disable no-console

export = (err: any) => {
  if (!err['cli-ux']) {
    console.error(err.stack)
    process.exitCode = 1
  }
  err.render()
  process.exitCode = err['cli-ux'].exit || process.exitCode || -1
}
