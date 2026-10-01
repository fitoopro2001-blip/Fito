'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Text } from '../../../components/atoms/Typography';
import Button from '../../../components/atoms/Button';
import Spinner from '../../../components/atoms/Spinner';
import CourseCard from '../../../components/organisms/courses/CourseCard';
import useApiResource from '../../../hooks/useApiResource';
import { getCourses } from '../../../services/course.service';
import { COURSE_CATEGORIES } from '../../../constants/courses';

export default function AcademyPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data: apiCourses, loading, error, reload } = useApiResource(getCourses, [], { fallback: [] });

  const courses = useMemo(() => {
    const all = apiCourses ?? [];
    return selectedCategory === 'all' ? all : all.filter((course) => course.category === selectedCategory);
  }, [apiCourses, selectedCategory]);

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-text">FITOO Academy</h1>
          <Text muted className="mt-3 max-w-2xl mx-auto">
            Learn practical nutrition, consultation, fitness coaching, and business skills through FITOO Academy
            onsite courses in Lahore. Explore the curriculum, practical work, and available enrolment options for
            each program.
          </Text>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {['all', ...COURSE_CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${selectedCategory === cat
                ? 'bg-primary border-primary text-text-inverse'
                : 'bg-transparent border-border-light text-text-secondary hover:text-text hover:border-primary/40'
                }`}
            >
              {cat === 'all' ? 'All Courses' : cat}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner className="w-8 h-8" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <Text className="text-danger">{error}</Text>
            <Button variant="outline" onClick={reload} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Text muted>No courses available in this category right now.</Text>
          </div>
        )}
      </div>
    </div>
  );
}
