'use client';

import { useState, useEffect, useCallback, ChangeEvent, memo } from 'react';
import {
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Footer from '@/components/footer/page';
import { toast } from 'react-hot-toast';
import { Model } from 'types/model';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { motion } from 'framer-motion';
import axios from 'axios';

const initialFormData = {
  sex: '',
  age: '',
  side: '',
  BW: '',
  Ht: '',
  'IKDC pre': '',
  'Lysholm pre': '',
  'Pre KL grade': '',
  'MM extrusion pre': '',
  'MM gap': '',
  'Degenerative meniscus': '',
  'medial femoral condyle': '',
  'medial tibial condyle': '',
  'lateral femoral condyle': ''
};

const tooltipDescriptions = {
  sex: 'Patient sex: Enter 0 for male, 1 for female',
  age: 'Patient age in years',
  side: 'Affected side: Enter 0 for left, 1 for right',
  BW: 'Body weight in kilograms',
  Ht: 'Height in centimeters',
  'IKDC pre':
    'Pre-operative International Knee Documentation Committee score (0-100)',
  'Lysholm pre': 'Pre-operative Lysholm knee score (0-100)',
  'Pre KL grade': 'Pre-operative Kellgren-Lawrence grade (0-4)',
  'MM extrusion pre': 'Medial meniscus extrusion in millimeters',
  'MM gap': 'Medial meniscus gap in millimeters',
  'Degenerative meniscus': 'Enter 0 for no, 1 for yes',
  'medial femoral condyle': 'Medial femoral condyle status score (0-4)',
  'medial tibial condyle': 'Medial tibial condyle status score (0-4)',
  'lateral femoral condyle': 'Lateral femoral condyle status score (0-4)'
};

const InputWithTooltip = memo(
  ({
    name,
    value,
    onChange
  }: {
    name: keyof typeof initialFormData;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <motion.div whileHover={{ scale: 1.02 }}>
      <RadixTooltip.Provider delayDuration={300}>
        <RadixTooltip.Root>
          <RadixTooltip.Trigger asChild>
            <div className="flex items-center justify-between">
              <span>{name}</span>
              <Input
                type="number"
                name={name}
                placeholder={name.toUpperCase()}
                value={value}
                onChange={onChange}
                className="max-w-[65%] flex-grow-1"
              />
            </div>
          </RadixTooltip.Trigger>
          <RadixTooltip.Portal>
            <RadixTooltip.Content
              className="rounded-md bg-gray-200 dark:bg-gray-700 px-4 py-2 text-sm text-black dark:text-white shadow-md z-50"
              sideOffset={5}
            >
              {tooltipDescriptions[name]}
              <RadixTooltip.Arrow className="fill-gray-200 dark:fill-gray-700" />
            </RadixTooltip.Content>
          </RadixTooltip.Portal>
        </RadixTooltip.Root>
      </RadixTooltip.Provider>
    </motion.div>
  )
);
InputWithTooltip.displayName = 'InputWithTooltip';

export default function PredictionPage() {
  const [formData, setFormData] = useState(initialFormData);

  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [featureImportance, setFeatureImportance] = useState<
    { feature: string; importance: number }[]
  >([]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get('/api/v1/model', {
          withCredentials: true
        });
        setModels(response.data);
      } catch (error) {
        console.error('Error fetching models:', error);
        toast.error('Failed to load models');
      }
    };
    fetchModels();
  }, []);

  // Memoized change handler
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  }, []); // Empty dependency array ensures stable reference

  const handlePredict = async () => {
    if (!selectedModel) {
      toast.error('Please select a model');
      return;
    }

    const numericData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        value === '' ? 0 : Number(value)
      ])
    );

    setIsLoading(true);
    try {
      const response = await axios.post(
        `/api/v1/nn/${selectedModel}`,
        {
          model_tag: selectedModel,
          input_data: numericData
        },
        {
          withCredentials: true
        }
      );

      const d = response.data;
      console.log(d[0]?.feature_importance);
      console.log(d[0]?.prediction);

      if (d[0]?.feature_importance) {
        const fi = d[0].feature_importance;
        const featureImportanceData = Object.entries(fi).map(
          ([key, value]) => ({
            feature: key,
            importance: value as number
          })
        );
        setFeatureImportance(featureImportanceData);
      }

      if (Array.isArray(d) && d[1] === 200) {
        const predictionValue = d[0]?.prediction;
        setResult(predictionValue);
      } else {
        throw new Error('Unexpected response structure');
      }
      toast.success('Prediction successful');
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error('Prediction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Responsive grid: single column on small screens, two columns on md+ */}
      <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          className="bg-white p-6 rounded-lg shadow dark:bg-[#101010]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1)' }}
        >
          <motion.h2
            className="text-xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Input
          </motion.h2>
          {/* Responsive grid: stack on mobile and show side-by-side on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 mt-4">
            <div>
              <motion.h3
                className="font-semibold mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Patient Information
              </motion.h3>
              <div className="space-y-3">
                {(
                  [
                    'sex',
                    'age',
                    'side',
                    'BW',
                    'Ht'
                  ] as (keyof typeof formData)[]
                ).map((key, index) => (
                  <InputWithTooltip
                    key={key}
                    name={key as keyof typeof formData}
                    value={formData[key as keyof typeof formData]}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </div>
            <div>
              <motion.h3
                className="font-semibold mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Pre Score
              </motion.h3>
              <div className="space-y-3">
                {(
                  [
                    'IKDC pre',
                    'Lysholm pre',
                    'Pre KL grade',
                    'MM extrusion pre',
                    'MM gap',
                    'Degenerative meniscus',
                    'medial femoral condyle',
                    'medial tibial condyle',
                    'lateral femoral condyle'
                  ] as (keyof typeof formData)[]
                ).map((key, index) => (
                  <InputWithTooltip
                    key={key}
                    name={key as keyof typeof formData}
                    value={formData[key as keyof typeof formData]}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              onClick={handlePredict}
              disabled={isLoading}
              className="mt-4 w-full bg-[#493DB1] text-[#FFFBFB] hover:bg-[#FFFBFB] hover:border-[#493DB1] hover:text-[#493DB1]
                        dark:bg-[#FFFBFB] dark:border-[#141414] dark:text-[#141414] dark:hover:bg-[#212121] dark:hover:text-[#FFFBFB]"
              variant="outline"
            >
              {isLoading ? (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Predicting...
                </motion.span>
              ) : (
                'Confirm'
              )}
            </Button>
          </motion.div>
        </motion.div>
        <motion.div
          className="bg-white p-6 rounded-lg shadow dark:bg-[#101010]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1)' }}
        >
          <motion.h2
            className="text-xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Prediction
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <Select onValueChange={setSelectedModel} value={selectedModel}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.name}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
          <motion.div
            className="mt-4 p-4 border rounded-lg bg-gray-100 dark:bg-[#212121]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="font-bold text-lg">
              Prediction Result (IKDC 2 Year)
            </div>
            {/* Using key to trigger re-render animation when result changes */}
            <motion.div
              key={result || 'no-result'}
              className="mt-2 p-2 text-base font-semibold bg-white dark:bg-[#101010] rounded-md shadow"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25
              }}
            >
              {result || 'No prediction yet'}
            </motion.div>
          </motion.div>

          {featureImportance.length > 0 && (
            <motion.div
              className="mt-8 bg-white p-6 rounded-lg shadow dark:bg-[#101010]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h2
                className="text-xl font-bold mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Feature Importance
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={featureImportance}
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: -50, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 13 }}
                      label={{
                        value: 'Importance',
                        position: 'insideBottom',
                        offset: -18
                      }}
                    />
                    <YAxis
                      dataKey="feature"
                      type="category"
                      tick={{ fontSize: 13 }}
                      width={200}
                      interval={0}
                    />
                    <RechartTooltip
                      formatter={(value: number) => value.toFixed(4)}
                      cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend />
                    <Bar
                      dataKey="importance"
                      fill="#8884d8"
                      barSize={20}
                      animationDuration={1500}
                    >
                      {featureImportance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#8884d8" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <Footer />
    </motion.div>
  );
}
