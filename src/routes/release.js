require('dotenv').config()
const {
  GITHUB_USERNAME = '',
  GITHUB_PERSONAL_TOKEN = '',
  GITHUB_REPO = '',
  NEWRELEASES_SECRET = '',
} = process.env

const emptyGitHubCommit = require('make-empty-github-commit')

module.exports = (api) => {
  api.post('/release', async (req, res) => {
    const {
      provider,
      project,
      version,
    } = req.body

    // Basic request validation.
    if (
      !req.rawHeaders['X-Newreleases-Timestamp'] ||
      !req.rawHeaders['X-Newreleases-Signature'] ||
      provider !== 'dockerhub' ||
      project !== 'node' ||
      !['10', '12'].includes(version)
    ) return res.status(400).send({ committed: false })

    // Verify the message was sent by newreleases.io by creating
    // a local signature and comparing it with the one in the headers.
    // https://newreleases.io/webhooks
    const messageToSign = `${req.rawHeaders['X-Newreleases-Timestamp']}.${JSON.stringify(req.body)}`
    const expectedSignature = crypto
      .createHmac('sha256', NEWRELEASES_SECRET)
      .update(messageToSign)
      .digest('hex')
    if (expectedSignature !== req.rawHeaders['X-Newreleases-Signature']) {
      return res.status(403).send({ committed: false })
    }

    const { sha } = await emptyGitHubCommit({
      owner: GITHUB_USERNAME,
      repo: GITHUB_REPO,
      token: GITHUB_PERSONAL_TOKEN,
      message: `${project}:${version} was pushed to Docker Hub.`,
      branch: `v${version}`
    })
    req.log.info('Published git commit', { sha })

    return { committed: true }
  })
}
