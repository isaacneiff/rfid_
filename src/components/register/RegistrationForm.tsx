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
import { UserPlus, Loader2 } from 'lucide-react';
import { registerCard } from '@/lib/actions';

const formSchema = z.object({
  userName: z.string().min(2, 'User name must be at least 2 characters.'),
  userRole: z.enum(['Admin', 'User', 'Guest'], { required_error: 'Please select a role.' }),
  cardUID: z.string().min(4, 'Card UID is required.'),
});

export function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: '',
      cardUID: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const result = await registerCard(
      {
        cardUID: values.cardUID,
        userName: values.userName,
      },
      values.userRole
    );

    if (result.success) {
      toast({
        title: 'Registration Successful',
        description: `${values.userName} has been registered with card ${values.cardUID}.`,
      });
      form.reset();
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
        <CardDescription>Fill in the user details and the RFID card UID to register it.</CardDescription>
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
             <FormField
              control={form.control}
              name="cardUID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card UID</FormLabel>
                  <FormControl>
                    <Input 
                        placeholder="e.g., 39C3BB99" 
                        {...field} 
                        onChange={e => field.onChange(e.target.value.toUpperCase())}
                        className="font-code"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the UID from the hardware scanner.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Register User
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
