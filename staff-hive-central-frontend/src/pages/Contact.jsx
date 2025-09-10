import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  ArrowLeft,
  MessageSquare,
  Users,
  Headphones
} from 'lucide-react';

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Mock API call - replace with real implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Staff Hive Central</h1>
                <p className="text-xs text-gray-500">HR Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <MessageSquare className="w-4 h-4" />
            Get in Touch
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contact Our Team
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about Staff Hive Central? We're here to help you streamline your HR operations.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Headphones className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 mt-1 text-blue-200" />
                  <div>
                    <p className="font-medium">Email Us</p>
                    <p className="text-blue-100">support@staffhivecentral.com</p>
                    <p className="text-blue-100">sales@staffhivecentral.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 mt-1 text-blue-200" />
                  <div>
                    <p className="font-medium">Call Us</p>
                    <p className="text-blue-100">+234 (0) 800 STAFF-HIVE</p>
                    <p className="text-blue-100">+234 (0) 800 782-334483</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-1 text-blue-200" />
                  <div>
                    <p className="font-medium">Visit Us</p>
                    <p className="text-blue-100">
                      123 Business District<br />
                      Victoria Island, Lagos<br />
                      Nigeria
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 mt-1 text-blue-200" />
                  <div>
                    <p className="font-medium">Business Hours</p>
                    <p className="text-blue-100">Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p className="text-blue-100">Saturday: 9:00 AM - 2:00 PM</p>
                    <p className="text-blue-100">Sunday: Closed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Contact Options */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-green-800">Sales Team</p>
                  <p className="text-sm text-green-600">New customers</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4 text-center">
                  <Headphones className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-medium text-purple-800">Support</p>
                  <p className="text-sm text-purple-600">Existing customers</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Send us a Message
                </CardTitle>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@company.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        name="company"
                        placeholder="Your company name"
                        value={formData.company}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="What's this about?"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={handleInputChange}
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Quick answers to common questions about Staff Hive Central
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  How quickly can I get started?
                </h3>
                <p className="text-gray-600">
                  You can sign up and start using Staff Hive Central immediately. Our setup wizard guides you through the initial configuration in under 10 minutes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Is my data secure?
                </h3>
                <p className="text-gray-600">
                  Yes, we use enterprise-grade security with encryption, regular backups, and comply with international data protection standards.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Do you offer training?
                </h3>
                <p className="text-gray-600">
                  We provide comprehensive onboarding, video tutorials, documentation, and live training sessions for your team.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What support do you provide?
                </h3>
                <p className="text-gray-600">
                  We offer 24/7 email support, live chat during business hours, and phone support for enterprise customers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}