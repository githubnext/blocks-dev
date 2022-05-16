export const onRequestGitHubData = async (
  path: string,
  params = {},
  token?: string
) => {
  // handle paths that accidentally include the domain
  const parsedPath = path.replace("https://api.github.com", "");

  const apiUrl = `https://api.github.com${parsedPath}`;
  const urlWithParams = `${apiUrl}?${new URLSearchParams(params)}`;

  const res = await fetch(urlWithParams, {
    headers: token ? { Authorization: `token ${token}` } : {},
    method: "GET",
  });

  if (res.status !== 200) {
    throw new Error(
      `Error fetching generic GitHub API data: ${apiUrl}\n${await res.text()}`
    );
  }

  const resObject = await res.json();
  return resObject;
};
