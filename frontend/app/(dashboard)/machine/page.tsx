'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import Footer from '@/components/footer/page';
import { useUser } from 'context/UserContext';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import axios from 'axios';

const Spinner = () => (
  <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-2 border-t-blue-500 rounded-full"></div>
);

// TypeScript interfaces for model data and update payload
interface AllModelResponse {
  id: number;
  name: string;
  model_architecture: string;
  final_loss?: number;
  model_path: string;
  bentoml_tag: string;
  is_active: boolean;
  created_at: string;
  csv_id?: number;
  r2: number;
  description: string;
}

interface AllModelUpdate {
  model_architecture?: string;
  final_loss?: number;
  model_path?: string;
  bentoml_tag?: string;
  is_active?: boolean;
  csv_id?: number;
}

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
  }
};

const formVariants = {
  hidden: { x: 50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  },
  exit: {
    x: 50,
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

export default function ModelManagement() {
  // State for fetched models
  const [models, setModels] = useState<AllModelResponse[]>([]);
  const [filter, setFilter] = useState('');

  // State for model metadata (for create/edit)
  const [newModel, setNewModel] = useState<Partial<AllModelResponse>>({
    name: '',
    model_architecture: '',
    final_loss: 0,
    model_path: '',
    bentoml_tag: '',
    is_active: true
  });

  // Additional state for CSV training parameters (used only on create)
  const [trainingDescription, setTrainingDescription] = useState('');
  const [trainingVersion, setTrainingVersion] = useState('');

  // Determines if we are in create mode or editing an existing model.
  // When editing, we use the model's name as its identifier.
  const [editModelName, setEditModelName] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isClick, setIsClick] = useState(false);

  // File state for CSV uploads
  const [file, setFile] = useState<File | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const { user } = useUser();
  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteModelName, setDeleteModelName] = useState<string | null>(null);
  const [modelArchitecture, setModelArchitecture] =
    useState<string>('NeuralNetwork');

  // Function to handle deletion after confirmation
  const confirmDelete = async () => {
    if (deleteModelName) {
      await handleDelete(deleteModelName);
      setIsDeleteModalOpen(false);
      setDeleteModelName(null);
    }
  };

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get<AllModelResponse[]>('/api/v1/model', {
          withCredentials: true
        });
        setModels(response.data);
      } catch (error) {
        toast.error('Failed to fetch models');
      }
    };
    fetchModels();
  }, [refreshTrigger]);

  const handleModelAdded = () => {
    setRefreshTrigger((prev) => !prev); // Toggle to trigger re-fetch
  };

  // Filter models based on name, created_at, or BentoML tag
  const filteredModels = models.filter(
    (model) =>
      (model.name && model.name.toLowerCase().includes(filter.toLowerCase())) ||
      (model.created_at && model.created_at.includes(filter)) ||
      (model.bentoml_tag &&
        model.bentoml_tag.toLowerCase().includes(filter.toLowerCase()))
  );

  // Create new model via training endpoint
  const handleCreate = async () => {
    if (!file) {
      toast.error('Please select a CSV file to upload');
      return;
    }
    setIsCreating(true);
    setIsClick(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Build query parameters from form state
      const queryParams = new URLSearchParams({
        name: newModel.name || '',
        version: trainingVersion,
        description: trainingDescription
      });
      const route =
        modelArchitecture == 'NeuralNetwork'
          ? 'model_train'
          : 'model_train_xg_boost';

      const response = await axios.post<AllModelResponse>(
        `/api/v1/${route}?${queryParams.toString()}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );
      // Update models state with the returned model data
      setModels([...models, response.data]);
      // Reset form state
      setNewModel({
        name: '',
        model_architecture: '',
        final_loss: 0,
        model_path: '',
        bentoml_tag: '',
        is_active: true
      });
      setTrainingDescription('');
      setTrainingVersion('');
      setFile(null);
      handleModelAdded();
      toast.success('Model trained and CSV uploaded successfully!');
    } catch (error) {
      toast.error('Failed to train model');
    } finally {
      setIsCreating(false);
      setIsClick(false);
    }
  };

  // Create new model via training endpoint using XG boost method
  const handleCreateXGBoost = async () => {
    if (!file) {
      toast.error('Please select a CSV file to upload');
      return;
    }
    setIsCreating(true);
    setIsClick(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Build query parameters from form state
      const queryParams = new URLSearchParams({
        name: newModel.name || '',
        version: trainingVersion,
        description: trainingDescription
      });
      const response = await axios.post<AllModelResponse>(
        `/api/v1/model_train_xg_boost?${queryParams.toString()}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );
      // Update models state with the returned model data
      setModels([...models, response.data]);
      // Reset form state
      setNewModel({
        name: '',
        model_architecture: '',
        final_loss: 0,
        model_path: '',
        bentoml_tag: '',
        is_active: true
      });
      setTrainingDescription('');
      setTrainingVersion('');
      setFile(null);
      handleModelAdded();
      toast.success('Model trained and CSV uploaded successfully!');
    } catch (error) {
      toast.error('Failed to train model');
    } finally {
      setIsCreating(false);
      setIsClick(false);
    }
  };

  // Update model metadata via PUT endpoint
  const handleEdit = async (modelName: string) => {
    try {
      const response = await axios.put<AllModelResponse>(
        `/api/v1/model/models/${modelName}`,
        newModel as AllModelUpdate,
        {
          withCredentials: true
        }
      );
      setModels(
        models.map((model) =>
          model.name === modelName ? response.data : model
        )
      );
      setEditModelName(null);
      setNewModel({
        name: '',
        model_architecture: '',
        final_loss: 0,
        model_path: '',
        bentoml_tag: '',
        is_active: true
      });
      toast.success('Model updated successfully!');
    } catch (error) {
      toast.error('Failed to update model');
    }
  };

  // Delete model via DELETE endpoint
  const handleDelete = async (modelName: string) => {
    try {
      await axios.delete(`/api/v1/model/${modelName}`, {
        withCredentials: true
      });
      setModels(models.filter((model) => model.name !== modelName));
      toast.success('Model deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete model');
    }
  };

  // Handle file input change to set file state
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0] || null;
    setFile(uploadedFile);
  };

  // Download CSV via the download endpoint
  const handleDownloadCSV = (csvId: number) => {
    const downloadUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/download/csv/${csvId}`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <motion.div
      className="flex flex-col min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4 md:p-8">
        <motion.div
          className="flex flex-col md:flex-row gap-4 mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.5,
            type: 'spring',
            stiffness: 100
          }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="bg-[#493DB1] text-[#FFFBFB] hover:bg-[#FFFBFB] hover:border-[#493DB1] hover:text-[#493DB1]
                         dark:bg-[#FFFBFB] dark:text-[#141414] dark:hover:bg-[#212121] dark:hover:border-[#212121] dark:hover:text-[#FFFBFB]
                         transition-all duration-300"
              variant={'outline'}
              onClick={() => {
                setEditModelName(null);
                setNewModel({
                  name: '',
                  model_architecture: '',
                  final_loss: 0,
                  model_path: '',
                  bentoml_tag: '',
                  is_active: true
                });
                setTrainingDescription('');
                setTrainingVersion('');
                setFile(null);
                setIsCreating(true);
              }}
            >
              Upload New Data and Create New Model
            </Button>
          </motion.div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: List of Models */}
          <motion.div
            className="w-full md:w-1/2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Input
                placeholder="Filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="mb-4"
              />
            </motion.div>
            <motion.div className="space-y-4" variants={containerVariants}>
              <AnimatePresence>
                {filteredModels.map((model, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{
                      type: 'spring',
                      stiffness: 100,
                      damping: 15,
                      delay: index * 0.05
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card>
                      <CardContent className="p-4 dark:bg-[#141414]">
                        <div className="flex-1">
                          <strong className="block">{model.name}</strong>
                          <div>{`Created: ${model.created_at}`}</div>
                          <div>{`Architecture: ${model.model_architecture}`}</div>
                          <div>{`RMSE: ${model.final_loss}`}</div>
                          <div>{`R2: ${model.r2}`}</div>
                          <div>{`Description: ${model.description}`}</div>
                          <div>{`BentoML Tag: ${model.bentoml_tag}`}</div>
                        </div>
                        <div className="flex flex-col gap-2 mt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {user?.role === 'admin' && (
                              <div className="flex flex-col sm:flex-row gap-2 col-span-1 sm:col-span-2 ">
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="w-full sm:w-1/2"
                                >
                                  <Button
                                    className="w-full bg-[#FFFBFB] border-[#493DB1] text-[#493DB1] hover:bg-[#493DB1] hover:text-[#FFFBFB]
                                              dark:bg-[#212121] dark:border-[#141414] dark:text-[#FFFBFB] dark:hover:bg-[#FFFBFB] dark:hover:text-[#212121]
                                              transition-all duration-300"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setIsCreating(false);
                                      setEditModelName(model.name);
                                      setNewModel({
                                        name: model.name,
                                        model_architecture:
                                          model.model_architecture,
                                        final_loss: model.final_loss || 0,
                                        model_path: model.model_path,
                                        bentoml_tag: model.bentoml_tag,
                                        is_active: model.is_active
                                      });
                                    }}
                                  >
                                    Edit
                                  </Button>
                                </motion.div>
                                <Dialog
                                  open={isDeleteModalOpen}
                                  onOpenChange={setIsDeleteModalOpen}
                                >
                                  <DialogTrigger asChild>
                                    <motion.div
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="w-full sm:w-1/2"
                                    >
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        className="w-full transition-all duration-300"
                                        onClick={() => {
                                          setDeleteModelName(model.name);
                                          setIsDeleteModalOpen(true);
                                        }}
                                      >
                                        Delete
                                      </Button>
                                    </motion.div>
                                  </DialogTrigger>
                                  <DialogContent className="rounded-lg sm:rounded-lg">
                                    <DialogHeader>
                                      <DialogTitle>Are you sure?</DialogTitle>
                                    </DialogHeader>
                                    <p>
                                      This action cannot be undone. Are you sure
                                      you want to delete model{' '}
                                      <strong>{deleteModelName}</strong>?
                                    </p>
                                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
                                      <Button
                                        variant="secondary"
                                        onClick={() =>
                                          setIsDeleteModalOpen(false)
                                        }
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={confirmDelete}
                                        className="mb-2 sm:mb-0"
                                      >
                                        Confirm
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            )}
                            {model.csv_id && (
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="col-span-1 sm:col-span-2"
                              >
                                <Button
                                  className="w-full bg-[#FFFBFB] border-[#493DB1] text-[#493DB1] hover:bg-[#493DB1] hover:text-[#FFFBFB]
                                            dark:bg-[#212121] dark:border-[#141414] dark:text-[#FFFBFB] dark:hover:bg-[#FFFBFB] dark:hover:text-[#212121]
                                            transition-all duration-300"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleDownloadCSV(model.csv_id as number)
                                  }
                                >
                                  Download CSV
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Right Column: Create/Edit Form */}
          <AnimatePresence mode="wait">
            {isCreating && (
              <motion.div
                key="create-form"
                className="w-full md:w-1/2"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h2 className="text-xl font-bold mb-4">
                  Upload New Data and Create New Model
                </h2>
                <Label>Name</Label>
                <Input
                  value={newModel.name}
                  onChange={(e) =>
                    setNewModel({ ...newModel, name: e.target.value })
                  }
                  placeholder="Model Name"
                  className="mb-4"
                />
                <Label>Upload CSV for Training</Label>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="mb-4"
                />
                <Label>Training Description</Label>
                <Input
                  value={trainingDescription}
                  onChange={(e) => setTrainingDescription(e.target.value)}
                  placeholder="Training Description"
                  className="mb-4"
                />
                <Label>Training Version</Label>
                <Input
                  value={trainingVersion}
                  onChange={(e) => setTrainingVersion(e.target.value)}
                  placeholder="Training Version"
                  className="mb-4"
                />
                <Label>Training Method</Label>
                <Select
                  onValueChange={setModelArchitecture}
                  defaultValue="NeuralNetwork"
                >
                  <SelectTrigger className="w-[180px] mb-4 bg-background text-foreground border border-input">
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NeuralNetwork">NeuralNetwork</SelectItem>
                    <SelectItem value="XGBoost">XGBoost</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex flex-col sm:flex-row gap-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => setIsCreating(false)}
                    >
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      className="bg-[#493DB1] text-[#FFFBFB] hover:bg-[#FFFBFB] hover:border-[#493DB1] hover:text-[#493DB1]
                      dark:bg-[#FFFBFB] dark:text-[#141414] dark:hover:bg-[#212121] dark:hover:border-[#212121] dark:hover:text-[#FFFBFB]
                      transition-all duration-300"
                      onClick={handleCreate}
                    >
                      {isClick ? <Spinner /> : 'Add Model'}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {editModelName !== null && (
              <motion.div
                key="edit-form"
                className="w-full md:w-1/2"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h2 className="text-xl font-bold mb-4">Edit Model</h2>
                <Label>Model Architecture</Label>
                <Input
                  value={newModel.model_architecture}
                  onChange={(e) =>
                    setNewModel({
                      ...newModel,
                      model_architecture: e.target.value
                    })
                  }
                  placeholder="Model Architecture"
                  className="mb-4"
                />
                <Label>Final Loss</Label>
                <Input
                  type="number"
                  value={newModel.final_loss?.toString() || '0'}
                  onChange={(e) =>
                    setNewModel({
                      ...newModel,
                      final_loss: Number(e.target.value)
                    })
                  }
                  placeholder="Final Loss"
                  className="mb-4"
                />
                <Label>Model Path</Label>
                <Input
                  value={newModel.model_path}
                  onChange={(e) =>
                    setNewModel({ ...newModel, model_path: e.target.value })
                  }
                  placeholder="Model Path"
                  className="mb-4"
                />
                <Label>BentoML Tag</Label>
                <Input
                  value={newModel.bentoml_tag}
                  onChange={(e) =>
                    setNewModel({ ...newModel, bentoml_tag: e.target.value })
                  }
                  placeholder="BentoML Tag"
                  className="mb-4"
                />
                <Label>Is Active</Label>
                <Input
                  type="checkbox"
                  checked={newModel.is_active || false}
                  onChange={(e) =>
                    setNewModel({ ...newModel, is_active: e.target.checked })
                  }
                  className="mb-4"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => setEditModelName(null)}
                    >
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      className="bg-[#493DB1] text-[#FFFBFB] hover:bg-[#FFFBFB] hover:border-[#493DB1] hover:text-[#493DB1]
                                dark:bg-[#FFFBFB] dark:text-[#141414] dark:hover:bg-[#212121] dark:hover:border-[#212121] dark:hover:text-[#FFFBFB]
                                transition-all duration-300"
                      onClick={() => handleEdit(editModelName)}
                    >
                      Update Model
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Footer />
      </motion.div>
    </motion.div>
  );
}
