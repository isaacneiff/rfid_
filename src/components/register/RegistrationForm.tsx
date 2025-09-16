'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ScanLine, UserPlus, Loader2 } from 'lucide-react';
import { CardDataReader } from './CardDataReader';
import type { CardData } from '@/lib/types';
import { registerCard } from '@/lib/actions';

const formSchema = z.object({
  userName: z.string().min(2, 'User name must be at least 2 characters.'),
  userRole: z.enum(['Admin', 'User', 'Guest'], { required_error: 'Please select a role.' }),
});

export function RegistrationForm() {
  const [isReading, setIsReading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: '',
    },
  });

  const handleReadCard = () => {
    setIsReading(true);
    // In a real scenario, this would involve a native call to the hardware.
    // For now, we simulate a read with a delay and mock data.
    setTimeout(() => {
      const randomUID = [...Array(8)].map(() => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join('');
      const newCard: CardData = {
        cardUID: randomUID,
        block1Data: 'New User Data',
        block2Data: 'Role: Unassigned',
        userName: '',
      };
      setCardData(newCard);
      setIsReading(false);
      toast({
        title: 'Card Read Successfully',
        description: `Card UID: ${newCard.cardUID}`,
      });
    }, 1500);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!cardData) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please read card data before registering.',
      });
      return;
    }
    
    setIsSubmitting(true);
    const result = await registerCard({
      ...cardData,
      userName: values.userName,
    }, values.userRole);

    if (result.success) {
      toast({
        title: 'Registration Successful',
        description: `${values.userName} has been registered with card ${cardData.cardUID}.`,
      });
      form.reset();
      setCardData(null);
    } else {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: result.error,
      });
    }
    setIsSubmitting(false);
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>New Card Registration</CardTitle>
        <CardDescription>Fill in the user details and read the RFID card to register it with Supabase.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="User">User</SelectItem>
                      <SelectItem value="Guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Card Data</h3>
                <Button type="button" variant="outline" onClick={handleReadCard} disabled={isReading || isSubmitting}>
                  {isReading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ScanLine className="mr-2 h-4 w-4" />
                  )}
                  {isReading ? 'Reading...' : 'Read Card'}
                </Button>
              </div>
              {cardData ? (
                 <CardDataReader cardData={cardData} />
              ) : (
                <div className="flex h-24 items-center justify-center rounded-md border-2 border-dashed">
                  <p className="text-sm text-muted-foreground">Waiting for card read...</p>
                </div>
              )}
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting || !cardData}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Register User
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
