import { Changelog as ChangelogType } from '../types';

interface Props {
  changelog: ChangelogType;
}

export const Changelog = ({ changelog }: Props) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{changelog.title}</h3>
          <p className="mt-2 text-gray-600">{changelog.content}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {new Date(changelog.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">
            {changelog.user.name}
          </span>
        </div>
      </div>
    </div>
  );
}; 