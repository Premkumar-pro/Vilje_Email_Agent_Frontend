import { getUserFromToken } from "../auth/api";

export default function Dashboard() {
  const user = getUserFromToken();

  return (
    <div className="dashboard">
      <h1>
        Hello, <strong>{user?.name}</strong>
      </h1>
    </div>
  );
}
