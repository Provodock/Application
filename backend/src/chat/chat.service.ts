import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventsService } from '../events/events.service';
import Groq from 'groq-sdk';

@Injectable()
export class ChatService {
  private groq: Groq;

  constructor(
    private configService: ConfigService,
    private eventsService: EventsService,
  ) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }

  async processChat(messages: any[], user?: any) {
    // 1. Fetch upcoming events to provide context to the AI
    const upcomingEvents = await this.eventsService.findAll();
    
    // 2. Format the context
    const eventsContext = upcomingEvents.map(e => {
      const d = new Date(e.date);
      const formattedDate = `${d.getMonth() + 1}.${d.getDate()}.${d.getFullYear()}`;
      return `- "${e.title}" on ${formattedDate} at ${e.location}. Tags: ${e.tags.map(t => t.name).join(', ')}. Capacity: ${e.participantsCount}/${e.capacity}. Status: ${e.isFull ? 'Full' : 'Open'}.`;
    }).join('\n');

    let userContext = `You are talking to an unregistered guest. They cannot register for events until they log in or create an account.`;
    
    if (user) {
      const uId = user.id || user.userId;
      const userEvents = await this.eventsService.findForUser(uId);
      const userEventsContext = userEvents.map(e => {
        const d = new Date(e.date);
        const formattedDate = `${d.getMonth() + 1}.${d.getDate()}.${d.getFullYear()}`;
        return `- "${e.title}" on ${formattedDate} at ${e.location}. Role: ${e.role}.`;
      }).join('\n');

      userContext = `You are talking to a registered user with email "${user.email}".
Here is a list of events they are currently registered for (either as a participant or organizer):
${userEventsContext || 'They are not currently registered for any events.'}
Remember, you can encourage them to check out new events and join them.`;
    }

    // 3. Prepare the system prompt
    const systemPrompt: any = {
      role: 'system',
      content: `You are a helpful, enthusiastic AI event assistant for the "Event Manager" application.
Your goal is to help users find interesting events, answer questions about the schedule, and provide recommendations.
Always answer in English only, regardless of the language the user asks in.
Be concise but friendly. Do not hallucinate events that are not in the list below.

--- USER CONTEXT ---
${userContext}

--- UPCOMING PUBLIC EVENTS (Context for you to answer questions) ---
${eventsContext || 'There are no upcoming public events at the moment.'}`
    };

    // 4. Send request to Groq
    try {
      const response = await this.groq.chat.completions.create({
        messages: [systemPrompt, ...messages],
        model: 'llama-3.3-70b-versatile', // or mixtral-8x7b-32768, depending on preference
        temperature: 0.7,
        max_tokens: 1024,
      });

      return {
        reply: response.choices[0]?.message?.content || 'I am sorry, I could not generate a response.',
      };
    } catch (error) {
      console.error('Groq API Error:', error);
      throw new Error('Failed to communicate with AI assistant.');
    }
  }
}
