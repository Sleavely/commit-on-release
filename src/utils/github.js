const {
  GITHUB_PERSONAL_TOKEN = '',
} = process.env

const { Octokit } = require("@octokit/rest")

exports.octokit = new Octokit({
  auth: GITHUB_PERSONAL_TOKEN,
})

/**
 *
 * @param {string} owner
 * @param {string} repo
 * @param {string} branch
 * @param {string} message Commit message
 */
exports.bumpBranch = async ({ owner, repo, branch, message }) => {
  // First we need to figure out the latest sha1 in the branch
  const { data: branchRef } = await this.octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`
  })
  const latestCommitSha = branchRef.object.sha

  // Since we want to make no changes, we can reuse the same tree object
  // (Tree objects are basically the directory state for your repository)
  const { data: latestCommit } = await this.octokit.git.getCommit({
    owner,
    repo,
    commit_sha: latestCommitSha,
  })
  const treeSha = latestCommit.tree.sha

  // Now we can create a commit that points to the same tree, with the previous commit as its parent.
  const { data: newCommit } = await this.octokit.git.createCommit({
    owner,
    repo,
    message,
    tree: treeSha,
    parents: [ latestCommitSha ]
  })

  // Yay. Now all we need to do is make sure refs/heads/{branch} points to the new commit.
  await this.octokit.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: newCommit.sha,
  })

  return newCommit
}
