import os
from git.repo import Repo
from git.repo.fun import is_git_dir


class GitRepository(object):
    """
    gitWarehouse management
    """

    def __init__(self, local_path, repo_url, branch='master'):
        self.local_path = local_path
        self.repo_url = repo_url
        self.repo = None
        self.initial(self.repo_url, branch)

    def initial(self, repo_url, branch):
        """
        initializationgitstorehouse
        :param repo_url:
        :param branch:
        :return:
        """
        if not os.path.exists(self.local_path):
            os.makedirs(self.local_path)
        git_local_path = os.path.join(self.local_path, '.git')
        if not is_git_dir(git_local_path):
            self.repo = Repo.clone_from(repo_url, to_path=self.local_path, branch=branch)
        else:
            self.repo = Repo(self.local_path)

    def pull(self):
        """
        Pull the latest code from online
        :return:
        """
        self.repo.git.pull()

    def branches(self):
        """
        Get all branches
        :return:
        """
        branches = self.repo.remote().refs
        return [item.remote_head for item in branches if item.remote_head not in ['HEAD', ]]

    def commits(self):
        """
        Get all submission records
        :return:
        """
        commit_log = self.repo.git.log('--pretty={"commit":"%h","author":"%an","summary":"%s","date":"%cd"}',
                                       max_count=50,
                                       date='format:%Y-%m-%d %H:%M')
        log_list = commit_log.split("\n")
        return [eval(item) for item in log_list]

    def tags(self):
        """
        Get alltag
        :return:
        """
        return [tag.name for tag in self.repo.tags]

    def tags_exists(self, tag):
        """
        tagDoes it exist
        :return:
        """
        return tag in self.tags()

    def change_to_branch(self, branch):
        """
        Switch branches
        :param branch:
        :return:
        """
        self.repo.git.checkout(branch)

    def change_to_commit(self, branch, commit):
        """
        Switchcommit
        :param branch:
        :param commit:
        :return:
        """
        self.change_to_branch(branch=branch)
        self.repo.git.reset('--hard', commit)

    def change_to_tag(self, tag):
        """
        Switchtag
        :param tag:
        :return:
        """
        self.repo.git.checkout(tag)

# if __name__ == '__main__':
# local_path = os.path.join('codes', 't1')
# repo = GitRepository(local_path, remote_path)
# branch_list = repo.branches()
# print(branch_list)
# repo.change_to_branch('dev')
# repo.pull()
