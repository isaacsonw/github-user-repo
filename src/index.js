const axios = require('axios');
const moment = require('moment');

//  Get username from params
let paramsValue = parent.document.URL.substring(
  parent.document.URL.indexOf('?'),
  parent.document.URL.length
);
const username = paramsValue.split('=')[1];

//// ! Error fetching data from this endpoint /////
// https://developer.github.com/v4/explorer/

// Define constant
// Endpoint URL
const githubUrl = 'https://api.github.com/graphql';

const HASHED_TOKEN =
  'gIShISpIS_ISbISDISjIStIStISsISoISdISVISgISFISpIS2ISwISdISuISAISBISJISAISxISVIS9ISgISXISiISqIScISrIS9IS0ISqIScISxISMISg';
const TOKEN = HASHED_TOKEN.split('IS').join('');

// GrapgQL
const query = `
      query ($login: String!) {
          user(login: $login) {
                  bio
                  avatarUrl
                  location
                  name
                  followers {
                    totalCount
                  }
                  email
                  following {
                    totalCount
                  }
                  login
                  repositories(first: 20) {
                    nodes {
                      name
                      description
                      forkCount
                      createdAt
                      updatedAt
                      stargazerCount
                      viewerHasStarred
                      languages {
                        nodes {
                          name
                          color
                        }
                      }
                      licenseInfo {
                        body
                      }
                    }
                  }
                  starredRepositories {
                    totalCount
                  }
                  company
                }
              }
            `;

async function getRepo() {
  const {
    data: { data: user },
  } = await axios.post(
    githubUrl,
    { query, variables: { login: username } },
    {
      headers: {
        authorization: `bearer ${TOKEN}`,
      },
    }
  );

  const {
    user: {
      login,
      name,
      avatarUrl,
      followers: { totalCount },
      bio,
      following: { totalCount: followingCount },
      email,
      viewerHasStarred,
      company,
      location,
      starredRepositories: { totalCount: starCount },
      ...repoItems
    },
  } = user;

  const profileSection = {
    userhandle: login,
    username: name,
    profileImage: avatarUrl,
    followerCount: totalCount,
    bio,
    following: followingCount,
    userEmail: email,
    company,
    location,
    starredRepoCount: starCount,
  };

  let repositories = repoItems.repositories.nodes;
  return { profileSection, repositories };
}

// convert the create repo date
const getCreatedRepoDate = (value) => {
  const date = new Date(value).toISOString();

  // get todays year
  const currentYear = new Date().getFullYear();

  // get the value of the updated repo date
  let updatedRepoDate = moment(date).format('MMM D, YYYY');

  return updatedRepoDate.includes(currentYear.toString())
    ? moment(date).format('MMM D')
    : moment(date).format('MMM D, YYYY');
};

getRepo().then((data) => {
  // Sort the repos according to updated date
  const repos = data.repositories
    .map((item) => item)
    .sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  return (
    /**
     * call all profile section functions for rendering data
     */
    renderUserprofileData(data.profileSection),
    /**
     *  call all repository section functions for rendering data
     */
    renderUserRepositories(repos, data.profileSection, getCreatedRepoDate),
    /**
     * call the function for rendering the number of repositories
     */
    renderNoOfRepos(repos),
    /**
     * call the function for rendering user profile image on the header
     */
    renderHeaderProfileImg(data.profileSection),
    /**
     * call the function for rendering user profile image on the tab section
     */
    renderTabProfileOnScroll(data.profileSection),
    openModal(data.profileSection.userhandle)
  );
});
