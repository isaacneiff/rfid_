'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Loader2 } from 'lucide-react';
import { registerCard } from '@/lib/actions';
import { useWebSocket } from '../providers/WebSocketProvider';

const formSchema = z.object({
  userName: z.string().min(2, 'O nome de usuário deve ter pelo menos 2 caracteres.'),
  userRole: z.enum(['Admin', 'User', 'Guest'], { required_error: 'Por favor, selecione um papel.' }),
  cardUID: z.string().min(4, 'O UID do cartão é obrigatório. Aproxime um cartão do leitor.').max(50, 'UID do cartão muito longo.'),
});

export function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { lastMessage } = useWebSocket();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: '',
      cardUID: '',
    },
  });

  // Efeito para preencher o campo de UID quando uma nova mensagem do WebSocket chegar
  useEffect(() => {
    if (lastMessage) {
        const newUID = lastMessage.trim().toUpperCase();
        console.log('Novo UID para registro:', newUID);
        form.setValue('cardUID', newUID, { shouldValidate: true });
    }
  }, [lastMessage, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const result = await registerCard(
      {
        userName: values.userName,
        cardUID: values.cardUID,
      },
      values.userRole
    );

    if (result.success) {
      toast({
        title: 'Registro bem-sucedido',
        description: `${values.userName} foi registrado com o cartão ${values.cardUID}.`,
      });
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Falha no Registro',
        description: result.error,
      });
    }
    setIsSubmitting(false);
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Registro de Novo Cartão</CardTitle>
        <CardDescription>Preencha os detalhes do usuário e aproxime um cartão do leitor RFID para registrar.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Usuário</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: João da Silva" {...field} />
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
                  <FormLabel>Função do Usuário</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Admin">Administrador</SelectItem>
                      <SelectItem value="User">Usuário</SelectItem>
                      <SelectItem value="Guest">Convidado</SelectItem>
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
                  <FormLabel>UID do Cartão</FormLabel>
                  <FormControl>
                    <Input 
                        placeholder="Aguardando leitura do cartão..." 
                        {...field} 
                        onChange={e => field.onChange(e.target.value.toUpperCase())}
                        className="font-code"
                        readOnly // Opcional: para evitar edição manual e forçar o uso do leitor
                    />
                  </FormControl>
                  <FormDescription>
                    O UID será preenchido automaticamente ao aproximar o cartão do leitor.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Registrar Usuário
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
