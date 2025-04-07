// app/products/ProductsContent.tsx
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { File, BarChart3 } from 'lucide-react';
import Image from 'next/image';

interface ProductsContentProps {
  search: string;
  offset: string;
}

export default function ProductsContent({ search, offset }: ProductsContentProps) {
  return (
    <div className="container mx-auto p-6">
      {/* Dashboard Header - Animate from left */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </motion.div>

      {/* Overview Cards - Animate from left */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Total Predictions</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-[#5933ff]" />
            <span className="text-2xl font-semibold text-[#5933ff]">1,245</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Models</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <File className="h-6 w-6 text-[#CD36FF]" />
            <span className="text-2xl font-semibold text-[#CD36FF]">38</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Accuracy Rate</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-[#FFE100]" />
            <span className="text-2xl font-semibold text-[#FFE100]">92.5%</span>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 1: Overview - Animate upward */}
      <motion.section
        id="overview"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
        className="mt-10"
      >
        <h2 className="text-2xl font-semibold">Understanding Meniscus Root Tear</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              The meniscus is a fibrocartilaginous structure in the knee that plays a crucial role in joint function. It provides several key benefits, including:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-700 dark:text-gray-300">
              <li>Distributing load to the knee</li>
              <li>Increasing stability of the tibiofemoral articulation</li>
              <li>Lubricating the knee joint</li>
              <li>Providing nutrients to the joint</li>
              <li>Strong shock absorption</li>
            </ul>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              Without the meniscus, the load on the articular cartilage increases, leading to the progression of osteoarthritis. One of the tear patterns that has become increasingly important is the meniscus root tear. This type of injury is notable due to its rapid progression of osteoarthritis, similar to the effects of a total meniscectomy. Early detection and treatment are critical for improving the patient's outcome.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Section 2: Types of Meniscus Root Tears - Animate upward */}
      <motion.section
        id="types"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        viewport={{ once: true }}
        className="mt-10"
      >
        <h2 className="text-2xl font-semibold">Types of Meniscus Root Tears</h2>
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          Meniscus root tears can be classified into five main types based on severity and structural damage:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
              <li><strong>Type I:</strong> Partial but stable root tear</li>
              <li><strong>Type II:</strong> Complete radial tear within 9 mm of the root</li>
              <li><strong>Type III:</strong> Bucket-handle tear with root detachment</li>
              <li><strong>Type IV:</strong> Complex oblique or longitudinal tear</li>
              <li><strong>Type V:</strong> Bony avulsion fracture of the root</li>
            </ul>
          </div>
          <div className="flex justify-end">
            <Image
              src="/state.webp"
              width={500}
              height={500}
              alt="Meniscus Root Tear"
              className="rounded-lg"
              priority
            />
          </div>
        </div>
      </motion.section>

      {/* Section 3: Conclusion - Animate upward */}
      <motion.section
        id="conclusion"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        viewport={{ once: true }}
        className="mt-10"
      >
        <h2 className="text-2xl font-semibold">Conclusion</h2>
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          The incidence of medial meniscus root tears has increased due to a better understanding by physicians and improved access to diagnostic tools like MRI. The root of the meniscus plays a critical role in maintaining the stability of the entire meniscus. A meniscus root tear disrupts the hoop stress function of the knee, which can lead to early-onset osteoarthritis.
        </p>
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          Most meniscus root tears occur in adults due to minor trauma, such as squatting or sitting. A "pop" sound is commonly reported during the injury. MRI is the investigation of choice due to its high sensitivity and specificity. Key MRI findings include cleft sign, ghost sign, and medial meniscus extrusion. A high index of suspicion is necessary for diagnosis, and confirmation comes through imaging.
        </p>
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          Early detection of meniscus root tears is crucial, as delayed diagnosis leads to greater meniscal extrusion and cartilage damage. Nonoperative treatments may alleviate pain and swelling in the short term, but they do not address the root cause. Meniscus root repair is recommended for acute tears or mild degeneration of the knee. Early treatment can prevent meniscal extrusion and reduce the likelihood of knee replacement.
        </p>
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          Additionally, biologic treatments show promise in enhancing meniscus repair, though further studies are needed to fully understand their role.
        </p>
      </motion.section>
    </div>
  );
}
