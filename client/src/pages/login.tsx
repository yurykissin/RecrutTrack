import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
console.log("[Login Page] Component loaded");

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  console.log("[Login Page] Rendering login component");
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    console.log("[Login Page] onSubmit triggered with data:", data);
    setIsLoading(true);
    
    console.log("Submitting login form with data:", data);

    try {
      const response: Response = await apiRequest("POST", "/api/auth/login", data);
      console.log("Login response status:", response.status);

      try {
        const result = await apiRequest<{ message: string, user: any }>("POST", "/api/auth/login", data);
        
        toast({
          title: "Success",
          description: "You have been logged in successfully!",
          variant: "default"
        });
      
        console.log("Navigating to /dashboard");
        navigate("/dashboard");
        console.log("User redirected to dashboard successfully after login.");
      
      } catch (error: any) {
        console.error("Login error:", error.message);
      
        form.setError("email", { message: error.message || "Login failed" });
      
        toast({
          title: "Login Failed",
          description: error.message || "Unexpected error",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Login error:", error.message);
      console.log("Login failed - setting error in form and showing toast");

      form.setError("email", { message: error.message || "Login failed" });

      toast({
        title: "Login Failed",
        description: error.message || "Unexpected error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      console.log("[Login Page] Login process complete, loading state reset");
    }
  };
  
  useEffect(() => {
    console.log("[Login Page] Rendering complete - UI visible to user");
  }, []);
  
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your.email@example.com" 
                        autoFocus
                        {...field} 
                        type="email"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="******" 
                        {...field} 
                        type="password"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log in"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Don't have an account? Contact your administrator.
          </p>
        </CardFooter>
      </Card>
      
    </div>
  );
}