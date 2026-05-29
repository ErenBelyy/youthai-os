import { redirect } from 'next/navigation';
import { auth } from 'src/lib/auth/options';

async function App() {
  const session = await auth();
  if (!session) redirect('/signin');
  redirect('/dashboard');
}

export default App;
