import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Search, 
  FileText, 
  Video, 
  HelpCircle,
  Star,
  Clock,
  User,
  ChevronRight,
  MessageCircle,
  Download,
  ExternalLink,
  Lightbulb,
  Shield,
  Users,
  Zap,
  Bookmark,
  ThumbsUp,
  Eye
} from "lucide-react";

const EnhancedKnowledge = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpen, count: 156 },
    { id: 'getting-started', name: 'Getting Started', icon: Zap, count: 12 },
    { id: 'user-management', name: 'User Management', icon: Users, count: 24 },
    { id: 'recruitment', name: 'Recruitment', icon: User, count: 18 },
    { id: 'reports', name: 'Reports & Analytics', icon: FileText, count: 15 },
    { id: 'security', name: 'Security', icon: Shield, count: 8 },
    { id: 'integrations', name: 'Integrations', icon: Zap, count: 11 },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: HelpCircle, count: 22 }
  ];

  const popularArticles = [
    {
      id: 1,
      title: 'Getting Started with Staff Hive Central',
      description: 'A comprehensive guide to setting up your HR management system',
      category: 'Getting Started',
      readTime: '5 min read',
      views: 1240,
      likes: 89,
      type: 'article',
      lastUpdated: '2024-05-10',
      featured: true
    },
    {
      id: 2,
      title: 'How to Post Your First Job',
      description: 'Step-by-step tutorial on creating and publishing job postings',
      category: 'Recruitment',
      readTime: '3 min read',
      views: 856,
      likes: 67,
      type: 'video',
      lastUpdated: '2024-05-08',
      featured: true
    },
    {
      id: 3,
      title: 'Managing Job Applications',
      description: 'Learn how to review, filter, and manage candidate applications',
      category: 'Recruitment',
      readTime: '7 min read',
      views: 742,
      likes: 54,
      type: 'article',
      lastUpdated: '2024-05-05',
      featured: true
    },
    {
      id: 4,
      title: 'Understanding Analytics Dashboard',
      description: 'Deep dive into HR metrics and how to interpret your data',
      category: 'Reports & Analytics',
      readTime: '10 min read',
      views: 634,
      likes: 43,
      type: 'article',
      lastUpdated: '2024-05-03',
      featured: false
    }
  ];

  const videoTutorials = [
    {
      id: 1,
      title: 'Platform Overview - 5 Minutes Tour',
      description: 'Quick walkthrough of all major features',
      duration: '5:23',
      thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
      views: 2150,
      category: 'Getting Started'
    },
    {
      id: 2,
      title: 'Setting Up Your Company Profile',
      description: 'Configure your organization settings and branding',
      duration: '3:45',
      thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
      views: 1420,
      category: 'Getting Started'
    },
    {
      id: 3,
      title: 'Advanced Filtering and Search',
      description: 'Master the search and filtering capabilities',
      duration: '7:12',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      views: 890,
      category: 'User Management'
    }
  ];

  const faqs = [
    {
      id: 1,
      question: 'How do I invite team members to the platform?',
      answer: 'Go to Settings > Team Management and click "Invite Member". Enter their email address and select their role.',
      category: 'User Management',
      helpful: 45,
      notHelpful: 3
    },
    {
      id: 2,
      question: 'Can I customize the job application form?',
      answer: 'Yes, you can customize application forms in Settings > Job Settings. Add custom fields, make fields required, and set up conditional logic.',
      category: 'Recruitment',
      helpful: 38,
      notHelpful: 2
    },
    {
      id: 3,
      question: 'How do I export applicant data?',
      answer: 'Navigate to the Applicants page, use the filters to select the data you want, then click "Export" and choose your preferred format (CSV, Excel, or PDF).',
      category: 'Reports & Analytics',
      helpful: 52,
      notHelpful: 1
    },
    {
      id: 4,
      question: 'Is my company data secure?',
      answer: 'Yes, we use enterprise-grade security including SSL encryption, regular backups, and SOC 2 compliance. All data is encrypted both in transit and at rest.',
      category: 'Security',
      helpful: 67,
      notHelpful: 0
    }
  ];

  const quickLinks = [
    { title: 'API Documentation', icon: FileText, url: '#', description: 'Complete API reference for developers' },
    { title: 'Status Page', icon: Zap, url: '#', description: 'Check system status and uptime' },
    { title: 'Feature Requests', icon: Lightbulb, url: '#', description: 'Submit ideas for new features' },
    { title: 'Contact Support', icon: MessageCircle, url: '#', description: 'Get help from our support team' }
  ];

  const filteredArticles = popularArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           article.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return Video;
      case 'article': return FileText;
      default: return FileText;
    }
  };

  return (
    <div className="p-6 space-y-6 ml-64">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600">Find answers, learn best practices, and get the most out of Staff Hive Central</p>
        </div>
        <Button>
          <MessageCircle className="h-4 w-4 mr-2" />
          Contact Support
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          className="pl-12 h-12 text-lg"
          placeholder="Search for answers, guides, and tutorials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                selectedCategory === category.id
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`h-6 w-6 mx-auto mb-2 ${
                selectedCategory === category.id ? 'text-blue-600' : 'text-gray-500'
              }`} />
              <p className="text-sm font-medium text-center">{category.name}</p>
              <p className="text-xs text-gray-500 text-center mt-1">{category.count} articles</p>
            </button>
          );
        })}
      </div>

      {/* Featured Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Featured Articles
          </CardTitle>
          <CardDescription>Most popular and helpful resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredArticles.filter(article => article.featured).map((article) => {
              const TypeIcon = getTypeIcon(article.type);
              return (
                <div key={article.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-4 w-4 text-blue-600" />
                      <Badge variant="outline">{article.category}</Badge>
                    </div>
                    <Bookmark className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{article.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {article.likes}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Tutorials */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Tutorials
            </CardTitle>
            <CardDescription>Step-by-step video guides for common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {videoTutorials.map((video) => (
              <div key={video.id} className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group">
                <div className="relative w-24 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-30 transition-colors">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-1 group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{video.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <Badge variant="outline" className="text-xs">{video.category}</Badge>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {video.views} views
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <Video className="h-4 w-4 mr-2" />
              View All Tutorials
            </Button>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Useful resources and tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <a
                  key={index}
                  href={link.url}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors group"
                >
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{link.title}</p>
                    <p className="text-xs text-gray-500">{link.description}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </a>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-sm pr-4">{faq.question}</h3>
                  <Badge variant="outline" className="text-xs">{faq.category}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">{faq.answer}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Was this helpful?</span>
                    <button className="flex items-center gap-1 hover:text-green-600 transition-colors">
                      <ThumbsUp className="h-3 w-3" />
                      Yes ({faq.helpful})
                    </button>
                    <button className="flex items-center gap-1 hover:text-red-600 transition-colors">
                      <span>No ({faq.notHelpful})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">Can't find what you're looking for?</p>
            <Button>
              <MessageCircle className="h-4 w-4 mr-2" />
              Ask a Question
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* All Articles */}
      {searchTerm && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              {filteredArticles.length} articles found for "{searchTerm}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredArticles.map((article) => {
                const TypeIcon = getTypeIcon(article.type);
                return (
                  <div key={article.id} className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TypeIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{article.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <Badge variant="outline">{article.category}</Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.views}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedKnowledge;