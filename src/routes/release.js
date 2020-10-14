require('dotenv').config()
const {
  GITHUB_USERNAME = '',
  GITHUB_PERSONAL_TOKEN = '',
  GITHUB_REPO = '',
} = process.env

const emptyGitHubCommit = require('make-empty-github-commit')

module.exports = (api) => {
  api.post('/release', async (req, res) => {
    const {
      provider,
      project,
      version,
    } = req.body

    // TODO: should use signature verification described here: https://newreleases.io/webhooks
    if (
      provider !== 'dockerhub' ||
      project !== 'node' ||
      !['10', '12'].includes(version)
    ) return res.status(400).send({ committed: false })

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
