import { describe, it, expect } from 'vitest';
import { buildHybridRankFusionPipeline } from '@/server/search/hybrid-search';

describe('Hybrid Search Engine ($rankFusion)', () => {
  it('builds MongoDB 8.0+/9.0 $rankFusion pipeline with exact weights', () => {
    // Simulated 3072-dimension query vector
    const mockEmbedding = new Array(3072).fill(0.01);
    const query = 'NVIDIA RTX 5090 Blackwell';

    const pipeline = buildHybridRankFusionPipeline({
      query,
      queryVector: mockEmbedding,
      limit: 10,
    });

    // 1. Verify pipeline structure
    expect(pipeline).toHaveLength(3);

    const rankFusionStage = pipeline[0] as any;
    expect(rankFusionStage).toHaveProperty('$rankFusion');

    const fusion = rankFusionStage.$rankFusion;
    expect(fusion).toHaveProperty('input');
    expect(fusion.input).toHaveProperty('pipelines');

    // 2. Vector Pipeline: Weight must be 0.7
    expect(fusion.combination.weights.vectorPipeline).toBe(0.7);
    const vectorStage = fusion.input.pipelines.vectorPipeline[0];
    expect(vectorStage).toHaveProperty('$vectorSearch');
    expect(vectorStage.$vectorSearch.index).toBe('products_vector_index');
    expect(vectorStage.$vectorSearch.path).toBe('embedding');
    expect(vectorStage.$vectorSearch.queryVector).toHaveLength(3072);

    // 3. Lexical Pipeline: Weight must be 0.3
    expect(fusion.combination.weights.textPipeline).toBe(0.3);
    const textStage = fusion.input.pipelines.textPipeline[0];
    expect(textStage).toHaveProperty('$search');
    expect(textStage.$search.index).toBe('products_text_index');
    expect(textStage.$search.compound.must[0].text.query).toBe(query);

    // 4. Projection Stage excludes embedding field
    const projectStage = pipeline[2] as any;
    expect(projectStage).toHaveProperty('$project');
    expect(projectStage.$project.embedding).toBe(0);
  });
});
