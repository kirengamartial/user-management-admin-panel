import { useEffect, useState } from 'react';
import { exportUsers, deleteUser } from '../services/api';
import { verifySignature } from '../utils/crypto';
import ConfirmDialog from './ConfirmDialog';

export default function UserTable({ onEdit, refresh }) {
  const [users, setUsers] = useState([]);
  const [publicKey, setPublicKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, userId: null });

  useEffect(() => {
    fetchUsers();
  }, [refresh]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await exportUsers();
      setPublicKey(data.publicKey);

      const usersList = Array.isArray(data.users) ? data.users : [];

      const verifications = {};
      for (const user of usersList) {
        const isValid = await verifySignature(user.email, user.signature, data.publicKey);
        verifications[user.id] = isValid;
      }

      setVerificationStatus(verifications);
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteDialog({ isOpen: true, userId: id });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(deleteDialog.userId);
      setDeleteDialog({ isOpen: false, userId: null });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setDeleteDialog({ isOpen: false, userId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, userId: null });
  };

  if (loading) {
    return <div style={styles.loading}>Loading users...</div>;
  }

  const validUsers = users.filter(user => verificationStatus[user.id]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>User Management</h2>
      <p style={styles.subtitle}>
        Showing {validUsers.length} of {users.length} users (only displaying users with valid signatures)
      </p>

      {validUsers.length === 0 ? (
        <p style={styles.empty}>No users with valid signatures found.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Created At</th>
              <th style={styles.th}>Verified</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {validUsers.map((user) => (
              <tr key={user.id} style={styles.row}>
                <td style={styles.td}>{user.id}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>
                  <span style={styles.badge}>{user.role}</span>
                </td>
                <td style={styles.td}>
                  <span style={user.status === 'active' ? styles.statusActive : styles.statusInactive}>
                    {user.status}
                  </span>
                </td>
                <td style={styles.td}>{new Date(user.createdAt).toLocaleString()}</td>
                <td style={styles.td}>
                  <span style={styles.verified}>✓ Valid</span>
                </td>
                <td style={styles.td}>
                  <button style={styles.editButton} onClick={() => onEdit(user)}>
                    Edit
                  </button>
                  <button style={styles.deleteButton} onClick={() => handleDeleteClick(user.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
  },
  loading: {
    padding: '20px',
    textAlign: 'center',
    color: '#666',
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: '#999',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  headerRow: {
    backgroundColor: '#f5f5f5',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd',
    fontWeight: 'bold',
    color: '#333',
  },
  row: {
    borderBottom: '1px solid #eee',
  },
  td: {
    padding: '12px',
  },
  badge: {
    padding: '4px 8px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  statusActive: {
    padding: '4px 8px',
    backgroundColor: '#e8f5e9',
    color: '#4caf50',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  statusInactive: {
    padding: '4px 8px',
    backgroundColor: '#ffebee',
    color: '#f44336',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  verified: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  editButton: {
    padding: '6px 12px',
    marginRight: '8px',
    backgroundColor: '#2196f3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};
