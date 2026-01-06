import { NextRequest, NextResponse } from 'next/server';

/**
 * YouTube Data API v3 route handler
 * Fetches videos based on search query and returns sanitized results
 * 
 * Privacy note: Only video metadata is returned, no user tracking
 */

interface YouTubeSearchItem {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium: {
        url: string;
      };
      high: {
        url: string;
      };
    };
  };
}

interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
  error?: {
    message: string;
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  // Validate query parameter
  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  // Check for API key
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error('YOUTUBE_API_KEY environment variable is not set');
    return NextResponse.json(
      { error: 'YouTube API is not configured' },
      { status: 500 }
    );
  }

  try {
    // Build YouTube API URL
    // maxResults 50 is the maximum allowed by YouTube API
    const youtubeApiUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    youtubeApiUrl.searchParams.set('part', 'snippet');
    youtubeApiUrl.searchParams.set('q', query);
    youtubeApiUrl.searchParams.set('type', 'video');
    youtubeApiUrl.searchParams.set('maxResults', '50');
    youtubeApiUrl.searchParams.set('videoEmbeddable', 'true');
    youtubeApiUrl.searchParams.set('safeSearch', 'moderate');
    youtubeApiUrl.searchParams.set('videoCategoryId', '10'); // Music category
    youtubeApiUrl.searchParams.set('key', apiKey);

    // Fetch from YouTube API
    const response = await fetch(youtubeApiUrl.toString(), {
      headers: {
        'Accept': 'application/json',
      },
      // Cache for 5 minutes to reduce API calls
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const errorData = await response.json() as YouTubeSearchResponse;
      console.error('YouTube API error:', errorData.error?.message);
      return NextResponse.json(
        { error: 'Failed to fetch videos from YouTube' },
        { status: response.status }
      );
    }

    const data = await response.json() as YouTubeSearchResponse;

    // Transform and sanitize response
    // Only return necessary fields: id, title, thumbnail, channel
    const videos = data.items
      .filter(item => item.id.kind === 'youtube#video')
      .map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        channelTitle: item.snippet.channelTitle,
      }));

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching videos' },
      { status: 500 }
    );
  }
}

