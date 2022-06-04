'use strict';

let { GITHUB_APP_CLIENT_ID, HOST } = process.env;

const redirect = async (req, res) => {
  const { did, digest, signature, encrypt } = req.query;
  // TODO: Check auth/signature, that its belong to it did/ethereum address

  const clientId = GITHUB_APP_CLIENT_ID;
  const scope = 'read:user';
  const encodedScope = encodeURIComponent(scope);

  const authorizationUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${encodedScope}`;
  const redirectUri = `${HOST}/api/githubCallback?did=${encodeURIComponent(
    did
  )}`;

  const encodedRedirectUri = encodeURIComponent(redirectUri);
  const finalAuthorizationUrl = `${authorizationUrl}&redirect_uri=${encodedRedirectUri}`;

  res.status(302);
  res.redirect(finalAuthorizationUrl);
}

module.exports = redirect;
