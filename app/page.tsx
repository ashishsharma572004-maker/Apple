// app/page.tsx
import MarioGame from '@/components/MarioGame';

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f4f6',
        padding: '2rem',
        fontFamily: 'sans-serif',
      }}
    >
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#111827' }}>
        Next.js Mario Mini Game
      </h1>
      <MarioGame />
    </main>
  );
}