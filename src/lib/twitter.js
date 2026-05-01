export function extractTweetId(url) {
  const m = (url || '').match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/)
  return m ? m[1] : null
}

export async function getTweetMetrics(tweetId) {
  const token = process.env.TWITTER_BEARER_TOKEN
  if (!token) return null
  try {
    const res = await fetch(
      `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
    )
    if (!res.ok) return null
    const json = await res.json()
    const m = json.data?.public_metrics
    if (!m) return null
    return {
      likes: m.like_count,
      retweets: m.retweet_count,
      replies: m.reply_count,
      quotes: m.quote_count ?? 0,
      impressions: m.impression_count ?? 0,
      total: m.like_count + m.retweet_count + m.reply_count + (m.quote_count ?? 0),
    }
  } catch {
    return null
  }
}

export async function getTweetDetails(tweetId) {
  const token = process.env.TWITTER_BEARER_TOKEN
  if (!token) return null
  try {
    const res = await fetch(
      `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=text,public_metrics&expansions=attachments.media_keys&media.fields=url,preview_image_url`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
    )
    if (!res.ok) return null
    const json = await res.json()
    const tweet = json.data
    const media = json.includes?.media?.[0]
    return {
      text: tweet?.text || '',
      imageUrl: media?.url || media?.preview_image_url || null,
    }
  } catch {
    return null
  }
}

