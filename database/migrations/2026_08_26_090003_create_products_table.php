<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('compare_at_price', 10, 2)->nullable();
            $table->unsignedTinyInteger('discount')->default(0);
            $table->string('style')->nullable();
            $table->json('tags')->nullable();
            $table->string('status')->default('active')->index();
            $table->string('approval_status')->default('pending')->index();
            $table->text('rejection_reason')->nullable();
            $table->decimal('rating', 3, 2)->default(0);
            $table->unsignedInteger('reviews_count')->default(0);
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamps();

            $table->index(['category_id', 'approval_status', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
