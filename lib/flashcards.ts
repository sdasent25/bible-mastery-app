import { supabase } from './supabase'

export type FlashcardCategory = {
  id: string
  userId: string
  name: string
  createdAt: string | null
}

export type Flashcard = {
  id: string
  userId: string
  verse: string
  reference: string
  status: 'new' | 'learning' | 'mastered'
  categoryId: string | null
  createdAt: string | null
}

type FlashcardCategoryRow = {
  id: string
  user_id: string
  name: string
  created_at: string | null
}

type FlashcardRow = {
  id: string
  user_id: string
  verse: string
  reference: string
  status: 'new' | 'learning' | 'mastered' | null
  category_id: string | null
  created_at: string | null
}

async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

function mapCategory(row: FlashcardCategoryRow): FlashcardCategory {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    createdAt: row.created_at
  }
}

function mapFlashcard(row: FlashcardRow): Flashcard {
  return {
    id: row.id,
    userId: row.user_id,
    verse: row.verse,
    reference: row.reference,
    status: row.status === 'learning' || row.status === 'mastered' ? row.status : 'new',
    categoryId: row.category_id,
    createdAt: row.created_at
  }
}

export async function getFlashcardCategories(): Promise<FlashcardCategory[]> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return []
  }

  const { data, error } = await supabase
    .from('flashcard_categories')
    .select('id, user_id, name, created_at')
    .eq('user_id', userId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error loading flashcard categories:', error)
    return []
  }

  return ((data || []) as FlashcardCategoryRow[]).map(mapCategory)
}

export async function getFlashcards(): Promise<Flashcard[]> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return []
  }

  const { data, error } = await supabase
    .from('flashcards')
    .select('id, user_id, verse, reference, status, category_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error loading flashcards:', error)
    return []
  }

  return ((data || []) as FlashcardRow[]).map(mapFlashcard)
}

export async function createFlashcardCategory(name: string): Promise<FlashcardCategory | null> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return null
  }

  const { data, error } = await supabase
    .from('flashcard_categories')
    .insert({
      user_id: userId,
      name
    })
    .select('id, user_id, name, created_at')
    .single<FlashcardCategoryRow>()

  if (error) {
    console.error('Error creating flashcard category:', error)
    return null
  }

  return mapCategory(data)
}

export async function createFlashcard(input: {
  verse: string
  reference: string
  categoryId: string
}): Promise<Flashcard | null> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return null
  }

  const { error } = await supabase
    .from('flashcards')
    .insert({
      user_id: userId,
      verse: input.verse,
      reference: input.reference,
      status: 'new',
      category_id: input.categoryId
    })

  if (error) {
    console.error('Error creating flashcard:', error)
    return null
  }

  // FETCH AFTER INSERT (RLS-safe)
  const { data, error: fetchError } = await supabase
    .from('flashcards')
    .select('id, user_id, verse, reference, status, category_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (fetchError) {
    console.error('Error fetching new flashcard:', fetchError)
    return null
  }

  return mapFlashcard(data)
}

export async function updateFlashcardStatus(
  flashcardId: string,
  status: 'new' | 'learning' | 'mastered'
): Promise<Flashcard | null> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return null
  }

  const { data, error } = await supabase
    .from('flashcards')
    .update({ status })
    .eq('id', flashcardId)
    .eq('user_id', userId)
    .select('id, user_id, verse, reference, status, category_id, created_at')
    .single<FlashcardRow>()

  if (error) {
    console.error('Error updating flashcard status:', error)
    return null
  }

  return mapFlashcard(data)
}

export async function deleteFlashcard(flashcardId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('flashcards')
    .delete()
    .eq('id', flashcardId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting flashcard:', error)
    return false
  }

  return true
}

export async function updateFlashcard(
  flashcardId: string,
  updates: { verse: string; reference: string }
): Promise<Flashcard | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('flashcards')
    .update({
      verse: updates.verse,
      reference: updates.reference
    })
    .eq('id', flashcardId)
    .eq('user_id', user.id)
    .select('id, user_id, verse, reference, status, category_id, created_at')
    .single()

  if (error) {
    console.error('Error updating flashcard:', error)
    return null
  }

  return {
    id: data.id,
    userId: data.user_id,
    verse: data.verse,
    reference: data.reference,
    status: data.status || 'new',
    categoryId: data.category_id,
    createdAt: data.created_at
  }
}
