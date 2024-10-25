import React, { useState, FormEvent } from 'react';
import type { NextPage } from 'next';
import styles from '../client/styles/Home.module.css';

const Home: NextPage = () => {
  const [topic, setTopic] = useState('');
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleCreateLearningPath();
  };

  const handleCreateLearningPath = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/learning-paths', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create learning path');
      }

      setLearningPath(data);
      console.log('Learning path created:', data);
      
    } catch (error) {
      console.error('Error creating learning path:', error);
      alert(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Learn Anything
        </h1>

        <p className={styles.description}>
          Enter a topic you want to learn
        </p>

        <form onSubmit={handleSubmit} className={styles.inputContainer}>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic..."
            className={styles.input}
          />
          <button
            type="submit"
            className={styles.button}
          >
            Create Learning Path
          </button>
        </form>

        {loading && (
          <div className={styles.loading}>
            Generating your learning path...
          </div>
        )}

        {learningPath && (
          <div className={styles.learningPath}>
            <h2>{learningPath.title}</h2>
            <p className={styles.description}>{learningPath.description}</p>
            
            <div className={styles.principles}>
              <h3>First Principles:</h3>
              <ul>
                {learningPath.firstPrinciples.map((principle, index) => (
                  <li key={index}>{principle}</li>
                ))}
              </ul>
            </div>

            <div className={styles.modules}>
              <h3>Learning Modules:</h3>
              {learningPath.modules.map((module, index) => (
                <div key={index} className={styles.module}>
                  <h4>{module.title}</h4>
                  <p>{module.description}</p>
                  <div className={styles.moduleDetails}>
                    <div>
                      <h5>Project:</h5>
                      <p>{module.projectDeliverable}</p>
                    </div>
                    <div>
                      <h5>Feynman Explanation:</h5>
                      <p>{module.feynmanExplanation}</p>
                    </div>
                    <div>
                      <h5>Resources:</h5>
                      <ul>
                        {module.resources.map((resource, i) => (
                          <li key={i}>{resource}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.features}>
          <div className={styles.feature}>
            <h3>First Principles</h3>
            <p>Break down complex topics into fundamental concepts</p>
          </div>
          <div className={styles.feature}>
            <h3>Feynman Technique</h3>
            <p>Learn by teaching and simplifying concepts</p>
          </div>
          <div className={styles.feature}>
            <h3>Project-Based</h3>
            <p>Apply knowledge through practical projects</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
