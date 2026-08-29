import { Problem, Difficulty, ProblemStatus } from '../types';

// Curated base templates
const PROBLEM_TEMPLATES = [
  { title: 'Two Sum & Optimal Hash Map Lookup', difficulty: 'Easy', tags: ['Array', 'Hash Map'] },
  { title: 'LRU Cache Design with O(1) Operations', difficulty: 'Medium', tags: ['Hash Map', 'Linked List', 'Design'] },
  { title: 'Merge K Sorted Linked Lists', difficulty: 'Hard', tags: ['Linked List', 'Heap', 'Divide & Conquer'] },
  { title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', tags: ['Sliding Window', 'Hash Map'] },
  { title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', tags: ['Tree', 'DFS', 'Dynamic Programming'] },
  { title: 'Trapping Rain Water with Two Pointers', difficulty: 'Hard', tags: ['Two Pointers', 'Array', 'Stack'] },
  { title: 'Valid Parentheses & Bracket Matching', difficulty: 'Easy', tags: ['Stack', 'String'] },
  { title: 'Word Search in 2D Matrix', difficulty: 'Medium', tags: ['Backtracking', 'DFS', 'Matrix'] },
  { title: 'Course Schedule & Topological Sort Cycle Detection', difficulty: 'Medium', tags: ['Graph', 'BFS', 'Topological Sort'] },
  { title: 'Coin Change Minimum Denominations', difficulty: 'Medium', tags: ['Dynamic Programming', 'Array'] },
  { title: 'Invert Binary Tree in O(N)', difficulty: 'Easy', tags: ['Tree', 'Recursion'] },
  { title: 'Median of Two Sorted Arrays', difficulty: 'Hard', tags: ['Binary Search', 'Array', 'Divide & Conquer'] },
  { title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', tags: ['Tree', 'Design', 'BFS'] },
  { title: 'Rotting Oranges Multi-Source BFS', difficulty: 'Medium', tags: ['BFS', 'Matrix', 'Queue'] },
  { title: 'Kth Largest Element in an Array', difficulty: 'Medium', tags: ['Heap', 'Quickselect'] },
  { title: 'Climbing Stairs DP Combinations', difficulty: 'Easy', tags: ['Dynamic Programming', 'Math'] },
  { title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', tags: ['Array', 'Dynamic Programming'] },
  { title: 'Container With Most Water Area', difficulty: 'Medium', tags: ['Two Pointers', 'Greedy'] },
  { title: 'Alien Dictionary Lexicographical Order', difficulty: 'Hard', tags: ['Graph', 'Topological Sort'] },
  { title: 'Construct Binary Tree from Preorder and Inorder', difficulty: 'Medium', tags: ['Tree', 'Divide & Conquer'] },
];

function generate1000Problems(): Problem[] {
  const list: Problem[] = [];
  const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];
  const statuses: ProblemStatus[] = ['Approved', 'Approved', 'Approved', 'Pending']; // 75% approved, 25% pending

  for (let i = 1; i <= 1024; i++) {
    const template = PROBLEM_TEMPLATES[(i - 1) % PROBLEM_TEMPLATES.length];
    const difficulty = (i <= PROBLEM_TEMPLATES.length ? template.difficulty : difficulties[i % 3]) as Difficulty;
    const status = (i % 5 === 0 ? 'Pending' : 'Approved') as ProblemStatus;
    const pad = String(i).padStart(4, '0');

    list.push({
      id: `CS-${i}`,
      title: `${template.title} #${i}`,
      slug: `${template.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}`,
      difficulty,
      defectClass: 'Algorithmic Inefficiency',
      tags: template.tags,
      status,
      statement: `### Description\nSolve challenge #${i} with optimal constraints.\n\n### Complexity\n- Time: $O(N)$\n- Space: $O(1)$`,
      starterCode: {
        python: `def solution_${i}(data):\n    # TODO: Implement optimal solution\n    return True`,
        javascript: `function solution_${i}(data) {\n  // TODO: Implement optimal solution\n  return true;\n}`,
        cpp: `bool solution_${i}() {\n    return true;\n}`
      },
      optimalTimeComplexity: difficulty === 'Hard' ? 'O(N log N)' : 'O(N)',
      optimalSpaceComplexity: difficulty === 'Hard' ? 'O(N)' : 'O(1)',
      testCases: [
        {
          id: `tc-${i}-1`,
          input: 'input=[1, 2, 3]',
          expectedOutput: 'True',
          isSample: true,
        },
      ],
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - i * 1800000).toISOString(),
    });
  }

  return list;
}

export const INITIAL_PROBLEMS: Problem[] = generate1000Problems();
