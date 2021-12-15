import React, { useState } from "react";
import "./Home.css";
import axios from "axios";

const RenderContents = ({ baseUrl, contents }) => {
  const [data, setData] = useState(contents);
  const getRepositoryContents = async (content, path, i) => {
    await axios
      .get(`${baseUrl()}/contents/${path}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      })
      .then((res) => {
        const updatedData = [...data];
        updatedData[i].files = res.data;
        setData(updatedData);
      });
  };
  return (
    <>
      <ol>
        {data.map((content, i) => (
          <li key={content.sha}>
            {content.type === "file" && (
              <>
                <a href={content.html_url} target="_blank" rel="noreferrer">
                  {content.name}
                </a>
              </>
            )}
            {content.type === "dir" && (
              <>
                <button
                  onClick={() =>
                    getRepositoryContents(content, content.path, i)
                  }
                >
                  {content.name}
                </button>
                {content?.files && (
                  <RenderContents baseUrl={baseUrl} contents={content?.files} />
                )}
              </>
            )}
          </li>
        ))}
      </ol>
    </>
  );
};

function App() {
  const [formData, setFormData] = useState({
    owner: "dineshchn23",
    repo: "task-tracker",
  });
  const [repoList, setRepoList] = useState([]);
  const [repoDetails, setRepoDetails] = useState({});

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const baseUrl = () =>
    `https://api.github.com/repos/${formData.owner}/${formData.repo}`;

  const getRepositories = async (e) => {
    // for authentication
    // const USERNAME = "dineshchn23";
    // const PASSWORD = "{password}";
    // await axios.get("https://api.github.com", {
    //   headers: {
    //     authorization: `basic ${Buffer.from(`${USERNAME}:${PASSWORD}`).toString(
    //       "base64"
    //     )}`,
    //   },
    // });
    await axios
      .get(`https://api.github.com/users/${formData.owner}/repos`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      })
      .then((res) => {
        setRepoList(res.data);
      });
  };

  const getRepositoryDetails = async (e) => {
    onChangeHandler(e);
    if (e.target.value)
      await axios
        .get(
          `https://api.github.com/repos/${formData.owner}/${e.target.value}`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          }
        )
        .then((res) => {
          setRepoDetails(res.data);
        });
    else setRepoDetails({});
  };

  const getRepositoryContents = async (content, path) => {
    await axios
      .get(
        `https://api.github.com/repos/${formData.owner}/${formData.repo}/contents`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      )
      .then((res) => setRepoDetails({ ...repoDetails, contents: res.data }));
  };

  return (
    <div className="App">
      <p>Enter any valid GitHub username to get started!!!</p>
      <label for="owner">Enter username: </label>
      <input
        type="text"
        name="owner"
        id="owner"
        value={formData.owner}
        onChange={(e) => onChangeHandler(e)}
      />
      &nbsp;<button onClick={(e) => getRepositories()}>Submit</button>
      <br></br>
      {repoList.length > 0 && (
        <>
          <label for="owner">Select Repository: </label>
          <select
            name="repo"
            placeholder="Select one repo"
            onChange={(e) => getRepositoryDetails(e)}
          >
            <option value="">Select</option>
            {repoList.map((repo) => (
              <option value={repo.name}>{repo.name}</option>
            ))}
          </select>
        </>
      )}
      {repoDetails.full_name && (
        <>
          <hr></hr>
          <h3>Fullname: {repoDetails.full_name}</h3>
          <button onClick={() => getRepositoryContents()}>Get Contents</button>
        </>
      )}
      {repoDetails.contents && (
        <RenderContents baseUrl={baseUrl} contents={repoDetails.contents} />
      )}
    </div>
  );
}

export default App;
