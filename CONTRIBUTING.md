# Contributing to SWASTHYAMITRA

Thank you for your interest in contributing to SWASTHYAMITRA! This document provides guidelines for contributing to our telemedicine platform.

## 🤝 How to Contribute

### 1. Fork the Repository
- Click the "Fork" button on the GitHub repository page
- Clone your forked repository locally:
  ```bash
  git clone https://github.com/YOUR_USERNAME/SWASTHYAMITRA.git
  cd SWASTHYAMITRA
  ```

### 2. Set Up Development Environment
```bash
# Install dependencies
npm run install-all

# Set up environment variables
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env

# Start development server
npm run dev
```

### 3. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

### 5. Commit Your Changes
```bash
git add .
git commit -m "Add: Brief description of your changes"
```

### 6. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```
Then create a Pull Request on GitHub.

## 📋 Development Guidelines

### Code Style
- Use consistent indentation (2 spaces)
- Follow existing naming conventions
- Add comments for complex logic
- Use meaningful variable and function names

### Frontend Guidelines
- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Implement responsive design

### Backend Guidelines
- Follow RESTful API conventions
- Add proper error handling
- Use middleware for common functionality
- Validate input data

### Database Guidelines
- Use Mongoose schemas for data validation
- Add proper indexes for performance
- Follow MongoDB best practices

## 🐛 Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/OS information

## ✨ Feature Requests

For feature requests, please:
- Check if the feature already exists
- Provide a clear description
- Explain the use case
- Consider implementation complexity

## 🧪 Testing

Before submitting a PR:
- Run the test suite: `npm test`
- Test on different browsers
- Test responsive design
- Verify API endpoints

## 📝 Documentation

- Update README.md for significant changes
- Add JSDoc comments for functions
- Update API documentation
- Include setup instructions for new features

## 🎯 Areas for Contribution

- **Frontend**: UI/UX improvements, new components
- **Backend**: API enhancements, performance optimization
- **AI Integration**: Chatbot improvements, voice features
- **Mobile**: PWA enhancements, offline functionality
- **Documentation**: Guides, tutorials, API docs
- **Testing**: Unit tests, integration tests
- **Accessibility**: ARIA labels, keyboard navigation
- **Internationalization**: New language support

## 📞 Getting Help

- Create an issue for questions
- Join our community discussions
- Check existing issues and PRs
- Review the documentation

## 🏆 Recognition

Contributors will be:
- Listed in the contributors section
- Mentioned in release notes
- Invited to join the core team (for significant contributions)

Thank you for contributing to SWASTHYAMITRA! Together, we can make healthcare more accessible. 🏥💙
