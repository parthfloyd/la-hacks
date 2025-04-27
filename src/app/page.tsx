import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for components that use browser-only APIs
const ChatInterface = dynamic(() => import('./components/ChatInterface'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <ChatInterface />
    </main>
  );
}
