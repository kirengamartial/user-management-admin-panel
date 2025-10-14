import { useState } from 'react';
import Head from 'next/head';
import UserForm from '../components/UserForm';
import UserTable from '../components/UserTable';
import UserGraph from '../components/UserGraph';

export default function Home() {
  const [editingUser, setEditingUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setEditingUser(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleCancel = () => {
    setEditingUser(null);
  };

  return (
    <div style={styles.container}>
      <Head>
        <title>Admin Panel - User Management</title>
        <meta name="description" content="Admin panel for user management" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={styles.main}>
        <h1 style={styles.heading}>Admin Panel</h1>
        <p style={styles.description}>
          User management with cryptographic verification and analytics
        </p>

        <UserGraph key={`graph-${refreshKey}`} />

        <UserForm
          user={editingUser}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />

        <UserTable
          onEdit={handleEdit}
          refresh={refreshKey}
        />
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  heading: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
  },
  description: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '40px',
  },
};
