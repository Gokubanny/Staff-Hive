import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  Award, 
  Play, 
  CheckCircle, 
  Star,
  Users,
  Target,
  TrendingUp,
  Filter,
  Search
} from "lucide-react";

export default function UserTrainingPage() {
  const [trainings, setTrainings] = useState([]);
  const [enrolledTrainings, setEnrolledTrainings] = useState([]);
  const [completedTrainings, setCompletedTrainings] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Mock training data
    const mockTrainings = [
      {
        id: 1,
        title: 'Cybersecurity Fundamentals',
        category: 'Security',
        duration: '4 hours',
        level: 'Beginner',
        instructor: 'Dr. Sarah Wilson',
        rating: 4.8,
        students: 1250,
        description: 'Learn the basics of cybersecurity, including threat identification, risk assessment, and best practices for data protection.',
        modules: [
          'Introduction to Cybersecurity',
          'Common Threats and Vulnerabilities', 
          'Risk Assessment Techniques',
          'Security Best Practices'
        ],
        certificate: true,
        mandatory: true,
        deadline: '2025-09-15',
        progress: 25
      },
      {
        id: 2,
        title: 'Advanced React Development',
        category: 'Technology',
        duration: '8 hours',
        level: 'Advanced',
        instructor: 'John Martinez',
        rating: 4.9,
        students: 890,
        description: 'Master advanced React concepts including hooks, context, performance optimization, and modern patterns.',
        modules: [
          'Advanced Hooks Patterns',
          'State Management with Context',
          'Performance Optimization',
          'Testing React Applications'
        ],
        certificate: true,
        mandatory: false,
        progress: 0
      },
      {
        id: 3,
        title: 'Leadership and Team Management',
        category: 'Management',
        duration: '6 hours',
        level: 'Intermediate',
        instructor: 'Emma Thompson',
        rating: 4.7,
        students: 650,
        description: 'Develop essential leadership skills and learn effective team management strategies.',
        modules: [
          'Leadership Fundamentals',
          'Team Building Strategies',
          'Communication Skills',
          'Conflict Resolution'
        ],
        certificate: true,
        mandatory: false,
        progress: 100,
        completed: true,
        completedDate: '2025-08-10'
      },
      {
        id: 4,
        title: 'Digital Marketing Essentials',
        category: 'Marketing',
        duration: '5 hours',
        level: 'Beginner',
        instructor: 'Michael Chen',
        rating: 4.6,
        students: 1100,
        description: 'Get started with digital marketing including SEO, social media, and content marketing.',
        modules: [
          'SEO Fundamentals',
          'Social Media Marketing',
          'Content Marketing Strategy',
          'Analytics and Measurement'
        ],
        certificate: true,
        mandatory: false,
        progress: 60
      },
      {
        id: 5,
        title: 'Data Analytics with Python',
        category: 'Technology',
        duration: '12 hours',
        level: 'Advanced',
        instructor: 'Dr. Lisa Parker',
        rating: 4.9,
        students: 420,
        description: 'Learn data analysis and visualization using Python, pandas, and matplotlib.',
        modules: [
          'Python for Data Analysis',
          'Working with Pandas',
          'Data Visualization',
          'Statistical Analysis'
        ],
        certificate: true,
        mandatory: false,
        progress: 0
      }
    ];

    setTrainings(mockTrainings);
    setEnrolledTrainings(mockTrainings.filter(t => t.progress > 0 && !t.completed));
    setCompletedTrainings(mockTrainings.filter(t => t.completed));
  }, []);

  const enrollInTraining = (trainingId) => {
    const updatedTrainings = trainings.map(training =>
      training.id === trainingId ? { ...training, progress: 1 } : training
    );
    setTrainings(updatedTrainings);
    setEnrolledTrainings(updatedTrainings.filter(t => t.progress > 0 && !t.completed));
  };

  const continueTraining = (trainingId) => {
    // In a real app, this would navigate to the training content
    alert(`Continuing training: ${trainings.find(t => t.id === trainingId)?.title}`);
  };

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'security':
        return 'bg-red-100 text-red-800';
      case 'technology':
        return 'bg-blue-100 text-blue-800';
      case 'management':
        return 'bg-green-100 text-green-800';
      case 'marketing':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTrainings = trainings.filter(training => {
    switch (filter) {
      case 'enrolled':
        return training.progress > 0 && !training.completed;
      case 'completed':
        return training.completed;
      case 'mandatory':
        return training.mandatory;
      case 'available':
        return training.progress === 0;
      default:
        return true;
    }
  });

  const stats = {
    totalTrainings: trainings.length,
    enrolled: enrolledTrainings.length,
    completed: completedTrainings.length,
    completionRate: trainings.length > 0 ? Math.round((completedTrainings.length / trainings.length) * 100) : 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Center</h1>
          <p className="text-gray-600">Enhance your skills with our comprehensive training programs</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Trainings</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalTrainings}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Currently Enrolled</p>
                <p className="text-2xl font-bold text-orange-600">{stats.enrolled}</p>
              </div>
              <Play className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All Trainings' },
          { key: 'enrolled', label: 'Enrolled' },
          { key: 'completed', label: 'Completed' },
          { key: 'mandatory', label: 'Mandatory' },
          { key: 'available', label: 'Available' }
        ].map((filterOption) => (
          <Button
            key={filterOption.key}
            variant={filter === filterOption.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(filterOption.key)}
          >
            {filterOption.label}
          </Button>
        ))}
      </div>

      {/* Training Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTrainings.map((training) => (
          <Card key={training.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{training.title}</h3>
                    {training.mandatory && (
                      <Badge className="bg-red-100 text-red-800 ml-2">Mandatory</Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mb-3">
                    <Badge className={getCategoryColor(training.category)}>
                      {training.category}
                    </Badge>
                    <Badge className={getLevelColor(training.level)}>
                      {training.level}
                    </Badge>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{training.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{training.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{training.students} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{training.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-gray-400" />
                      <span>{training.certificate ? 'Certificate' : 'No Certificate'}</span>
                    </div>
                  </div>

                  {training.instructor && (
                    <p className="text-sm text-gray-600 mb-4">
                      Instructor: <span className="font-medium">{training.instructor}</span>
                    </p>
                  )}

                  {training.mandatory && training.deadline && (
                    <div className="flex items-center gap-1 text-sm text-red-600 mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {new Date(training.deadline).toLocaleDateString()}</span>
                    </div>
                  )}

                  {training.progress > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Progress</span>
                        <span className="text-sm text-gray-600">{training.progress}%</span>
                      </div>
                      <Progress value={training.progress} className="w-full" />
                    </div>
                  )}

                  {training.completed && training.completedDate && (
                    <div className="flex items-center gap-1 text-sm text-green-600 mb-4">
                      <CheckCircle className="h-4 w-4" />
                      <span>Completed on {new Date(training.completedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {training.completed ? (
                  <Button variant="outline" className="flex-1" disabled>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completed
                  </Button>
                ) : training.progress > 0 ? (
                  <Button 
                    className="flex-1"
                    onClick={() => continueTraining(training.id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Continue Training
                  </Button>
                ) : (
                  <Button 
                    className="flex-1"
                    onClick={() => enrollInTraining(training.id)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Start Training
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredTrainings.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trainings found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No training programs are currently available.' 
                : `No trainings match the ${filter} filter.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}