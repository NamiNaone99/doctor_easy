'use client';
import React, { useState, useEffect } from 'react';
import { User, UserUpdateData } from 'types/customer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter
} from '@/components/ui/dialog';
import Footer from '@/components/footer/page';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserUpdateData>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: {
        duration: 0.3
      }
    }
  };

  // Function to handle deletion after confirmation
  const confirmDelete = async () => {
    if (deleteUserId) {
      await handleDeleteClick(deleteUserId);
      setIsDeleteModalOpen(false);
      setDeleteUserId(null);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get<User[]>('/api/v1/users', {
          withCredentials: true
        });
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      // Avoid pre-filling the password for security reasons
      role: user.role,
      is_active: user.is_active
    });
  };

  const handleDeleteClick = async (userId: number) => {
    try {
      await axios.delete(`/api/v1/users/${userId}`, {
        withCredentials: true
      });
      setUsers(users.filter((cust) => cust.id !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const response = await axios.put<User>(
        `/api/v1/users/${selectedUser.id}`,
        formData,
        {
          withCredentials: true
        }
      );
      setUsers((prev) =>
        prev.map((cust) => (cust.id === selectedUser.id ? response.data : cust))
      );
      setSelectedUser(null);
      toast.success('User updated successfully');
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 space-y-8 min-h-screen"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="dark:bg-[#141414]">
          <CardHeader>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <CardTitle>Users</CardTitle>
              <CardDescription>View, update, and delete users.</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5
                }}
                className="text-center"
              >
                <p>Loading...</p>
              </motion.div>
            ) : error ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500"
              >
                {error}
              </motion.p>
            ) : (
              <AnimatePresence mode="wait">
                <motion.ul
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence>
                    {users.map((user) => (
                      <motion.li
                        key={user.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className="flex flex-col md:flex-row justify-between items-start md:items-center border p-4 rounded"
                        whileHover={{
                          scale: 1.02,
                          boxShadow: '0px 3px 10px rgba(0,0,0,0.1)'
                        }}
                      >
                        <div className="flex flex-col md:flex-row gap-3">
                          <p className="font-bold">Username: {user.username}</p>
                          <p>Role: {user.role}</p>
                          <p>
                            Status: {user.is_active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-row gap-2">
                          {/* Edit Modal using shadcn/ui Dialog */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <motion.button
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openEditModal(user)}
                              >
                                Edit
                              </motion.button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                                <DialogDescription>
                                  Update the details of the user.
                                </DialogDescription>
                              </DialogHeader>
                              <form
                                onSubmit={handleFormSubmit}
                                className="space-y-4"
                              >
                                <div>
                                  <label
                                    htmlFor="username"
                                    className="block text-sm font-medium"
                                  >
                                    Username
                                  </label>
                                  <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username || ''}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full"
                                  />
                                </div>
                                <div>
                                  <label
                                    htmlFor="password"
                                    className="block text-sm font-medium"
                                  >
                                    Password
                                  </label>
                                  <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Leave blank to keep unchanged"
                                    value={formData.password || ''}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div>
                                  <label
                                    htmlFor="role"
                                    className="block text-sm font-medium"
                                  >
                                    Role
                                  </label>
                                  <Input
                                    id="role"
                                    name="role"
                                    type="text"
                                    value={formData.role || ''}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="flex items-center">
                                  <input
                                    id="is_active"
                                    name="is_active"
                                    type="checkbox"
                                    checked={formData.is_active || false}
                                    onChange={handleInputChange}
                                    className="mr-2"
                                  />
                                  <label
                                    htmlFor="is_active"
                                    className="text-sm font-medium"
                                  >
                                    Active
                                  </label>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <Button type="submit">Save Changes</Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>

                          {/* Delete Modal */}
                          <Dialog
                            open={isDeleteModalOpen}
                            onOpenChange={setIsDeleteModalOpen}
                          >
                            <DialogTrigger asChild>
                              <motion.button
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-3"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setDeleteUserId(user.id);
                                  setIsDeleteModalOpen(true);
                                }}
                              >
                                Delete
                              </motion.button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Are you sure?</DialogTitle>
                              </DialogHeader>
                              <p>
                                This action cannot be undone. Are you sure you
                                want to delete user{' '}
                                <strong>{user.username}</strong>?
                              </p>
                              <DialogFooter>
                                <Button
                                  variant="secondary"
                                  onClick={() => setIsDeleteModalOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDeleteClick(user.id)}
                                >
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Footer />
      </motion.div>
    </motion.div>
  );
};

export default UsersPage;
