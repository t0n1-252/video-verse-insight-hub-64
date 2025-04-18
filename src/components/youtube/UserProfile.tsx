
import { Button } from '@/components/ui/button';

interface UserProfileProps {
  user: {
    name: string;
    email: string;
    picture: string;
  };
  onSignOut: () => void;
}

const UserProfile = ({ user, onSignOut }: UserProfileProps) => {
  return (
    <div className="flex flex-col items-center p-6 space-y-4">
      <div className="flex items-center space-x-2">
        <img
          src={user.picture}
          alt={user.name}
          className="w-10 h-10 rounded-full"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const div = document.createElement('div');
              div.className = 'w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center';
              div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
              parent.prepend(div);
            }
          }}
        />
        <div>
          <p className="font-medium text-gray-100">{user.name}</p>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>
      </div>
      <Button
        variant="outline"
        className="bg-red-600 hover:bg-red-700 border-red-700 text-white"
        onClick={onSignOut}
      >
        Sign Out
      </Button>
    </div>
  );
};

export default UserProfile;
